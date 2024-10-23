const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
//Clave secreta para firmar el token
const SECRET_KEY = 'claveSecretaParaJWT'; 
const PORT = 3000;

app.use(bodyParser.json());
app.use(cookieParser());

//Simulación de una base de datos de usuarios
const usuarios = [
  { id: 1, nombre: 'admin', contrasena: '123456', rol: 'admin' },
  { id: 2, nombre: 'usuario', contrasena: 'password', rol: 'usuario' }
];

//Ruta para iniciar sesión (Login)
app.post('/login', (req, res) => {
  const { nombre, contrasena } = req.body;

  //Verificar si el usuario existe y la contraseña es correcta
  const usuario = usuarios.find(u => u.nombre === nombre && u.contrasena === contrasena);

  if (!usuario) {
    return res.status(401).json({
        error: true,
        codigo: 401,
        mensaje: 'Credenciales inválidas' 
    });
  }

  //Crear el payload del token JWT
  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    rol: usuario.rol
  };

  //Generar el token JWT
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

  //Guardar el token en una cookie del navegador
  res.cookie('token', token, { httpOnly: true });
  res.json({ 
    mensaje: 'Inicio de sesión exitoso, token generado',
    token: token
  });
});

//Middleware para verificar el token
function verificarToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ mensaje: 'No se encontró el token, acceso denegado' });
  }

  jwt.verify(token, SECRET_KEY, (err, usuario) => {
    if (err) {
      return res.status(403).json({ mensaje: 'Token inválido o expirado' });
    }

    //Si el token es válido, guardamos la información del usuario en la request
    req.usuario = usuario;
    next();
  });
}

//Ruta protegida para el administrador
app.get('/admin', verificarToken, (req, res) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No tienes permisos de administrador' });
  }

  res.json({ mensaje: `Bienvenido a la página de administración, ${req.usuario.nombre}` });
});

//Ruta para el índice (pública)
app.get('/', (req, res) => {
  res.send('<h1>Página de inicio</h1><p>Esta es una página pública.</p>');
});

//Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
