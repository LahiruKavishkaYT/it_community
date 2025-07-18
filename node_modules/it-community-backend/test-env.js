require('dotenv').config();

console.log('Environment variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');

if (process.env.JWT_SECRET) {
  console.log('JWT_SECRET value:', process.env.JWT_SECRET);
}
