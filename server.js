const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Menangkap error tersembunyi cPanel dan menyimpannya ke file log
process.on('uncaughtException', (err) => {
  fs.appendFileSync(path.join(__dirname, 'cpanel-error.log'), err.stack + '\n');
  process.exit(1);
});

// Memaksa mode produksi untuk mencegah Next.js menjalankan mode Dev (yang butuh Turbopack/SWC)
process.env.NODE_ENV = 'production';
const dev = false;
const port = process.env.PORT || 3000;

// SANGAT PENTING: Passenger cPanel sering salah membaca direktori root
const app = next({ 
  dev,
  dir: __dirname 
});
const handle = app.getRequestHandler();

const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join personal room based on user role and id
    socket.on('join_room', ({ role, id }) => {
      socket.join(`${role}_${id}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { senderRole, senderId, receiverRole, receiverId, content } = data;
        
        // Save to database
        const message = await prisma.message.create({
          data: {
            content,
            status: "SENT",
            senderGuruId: senderRole === 'guru' ? parseInt(senderId) : null,
            senderSiswaId: senderRole === 'siswa' ? parseInt(senderId) : null,
            receiverGuruId: receiverRole === 'guru' ? parseInt(receiverId) : null,
            receiverSiswaId: receiverRole === 'siswa' ? parseInt(receiverId) : null,
          }
        });

        // Emit to receiver
        io.to(`${receiverRole}_${receiverId}`).emit('receive_message', message);
        // Echo to sender so they know it sent successfully
        io.to(`${senderRole}_${senderId}`).emit('message_sent', message);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(err => {
  fs.appendFileSync(path.join(__dirname, 'cpanel-error.log'), 'Prepare error: ' + err.stack + '\n');
  process.exit(1);
});
