export const calculateProfileCompletion = (siswa) => {
  if (!siswa) return 0;
  
  const fieldsToCheck = [
    'nisn', 'nis', 'nama', 'gender', 'email', 'nik', 'kk', 
    'tmp_lahir', 'tgl_lahir', 'akta_lahir', 'alamat', 'hp', 
    'hp_ortu', 'nama_ortu', 'pekerjaan_ortu', 'ekskul'
  ];
  
  const totalFields = fieldsToCheck.length;
  let filledFields = 0;
  
  fieldsToCheck.forEach(field => {
    if (siswa[field] && String(siswa[field]).trim() !== '') {
      filledFields++;
    }
  });
  
  return Math.round((filledFields / totalFields) * 100);
};

export const getProfileProgressColor = (percentage) => {
  if (percentage < 50) return 'bg-rose-500';
  if (percentage < 100) return 'bg-amber-400';
  return 'bg-emerald-500';
};
