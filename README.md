
# Introducción a la Autenticación con JWT

## ¿Qué es JWT?
JWT (JSON Web Token) es un estándar abierto (RFC 7519) que permite la transmisión segura de datos entre las partes como un objeto JSON. Este token es autodescriptivo, ya que contiene toda la información requerida para autenticar y autorizar al usuario. Un JWT tiene tres partes:

```plaintext
Header.Payload.Signature
```

## ¿Por qué debemos agregar seguridad a nuestros servicios?
Las aplicaciones web modernas suelen necesitar autenticar usuarios para proteger recursos sensibles. Sin la implementación de medidas de seguridad, los datos confidenciales pueden verse comprometidos, exponiendo los servicios a diferentes tipos de ataques, como suplantación de identidad o accesos no autorizados.

## El modelo Stateless
En un modelo **stateless**, el servidor no almacena información sobre las solicitudes anteriores de los clientes. Cada solicitud es independiente y debe contener toda la información necesaria. **JWT** encaja perfectamente en este modelo porque el token incluye la información necesaria para verificar al usuario sin necesidad de mantener sesiones en el servidor.

## Seguridad con JWT

### Firma de token
La seguridad en JWT se basa en firmar el token digitalmente. La firma garantiza que el contenido del token no ha sido alterado. Esto se realiza utilizando un algoritmo de hashing, como HMAC o RSA, y una clave secreta.

```plaintext
Header.Payload.Signature
```

- **Header**: contiene el tipo de token (JWT) y el algoritmo de firma.
- **Payload**: contiene los datos que queremos transmitir (como el ID del usuario y su rol).
- **Signature**: se crea firmando el **header** y el **payload** usando la clave secreta.

### Clave del servidor
La clave secreta es fundamental para la seguridad del token. Esta clave solo debe estar en el servidor y debe mantenerse en secreto para evitar que alguien pueda generar tokens fraudulentos.

## Proceso de autenticación

### Flujo de autenticación

Vamos a visualizar el flujo del proceso de autenticación usando un diagrama de secuencia:

```mermaid
sequenceDiagram
    Cliente->>Servidor: Envío de credenciales (usuario y contraseña)
    Servidor->>Servidor: Verificación de credenciales
    alt Credenciales válidas
        Servidor->>Cliente: Token JWT generado
        Cliente->>Cliente: Almacena token en una cookie
    else Credenciales inválidas
        Servidor->>Cliente: Error de autenticación
    end
    Cliente->>Servidor: Solicitud a /admin con el token en la cookie
    Servidor->>Servidor: Verifica token (firma y validez)
    alt Token válido
        Servidor->>Cliente: Acceso a /admin permitido
    else Token inválido
        Servidor->>Cliente: Acceso denegado
    end
```

### Ejemplo de generación de token con `sign`

En el servidor, el token se genera de la siguiente manera utilizando `jsonwebtoken`:

```javascript
const jwt = require('jsonwebtoken');

const payload = { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol };
const claveSecreta = 'claveSecretaParaJWT';
const token = jwt.sign(payload, claveSecreta, { expiresIn: '1h' });
console.log(token);
```

### Ejemplo de verificación de token con `verify`

Cada vez que el cliente realiza una solicitud a un endpoint protegido, el servidor verifica el token de la siguiente manera:

```javascript
const token = req.cookies.token;
jwt.verify(token, claveSecreta, (err, usuario) => {
  if (err) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
  req.usuario = usuario; // Token válido, continuar con la solicitud
});
```

## Tiempo de vida y caducidad de token
El token tiene una vida útil limitada, especificada en el campo `exp` del **payload**. Cuando el token caduca, el cliente debe autenticarse nuevamente para obtener uno nuevo.

```json
{
  "id": "1",
  "nombre": "admin",
  "rol": "admin",
  "exp": 1698771200
}
```

## JWT vs. Variables de Sesión y Cookies
- **JWT**: Almacena la autenticación en el lado del cliente y es **stateless**. Esto mejora la escalabilidad.
- **Variables de sesión**: Dependen de que el servidor mantenga el estado entre las solicitudes, lo que puede generar problemas de escalabilidad.
- **Cookies**: Se pueden usar para almacenar el token JWT de manera segura (`httpOnly`), enviándolo automáticamente con cada solicitud.

### Comparación entre métodos

| Característica         | JWT (stateless)  | Sesión (stateful) | Cookies tradicionales |
|------------------------|------------------|-------------------|------------------------|
| Almacenamiento          | Cliente          | Servidor          | Servidor               |
| Escalabilidad           | Alta             | Baja              | Media                  |
| Seguridad               | Alta (si es firmado) | Moderada         | Baja                   |
| Facilidad de uso        | Media            | Alta              | Alta                   |

## Estructura de un token JWT

Un token JWT consta de tres partes, separadas por puntos (`.`):

1. **Header (Cabecera)**: Contiene el tipo de token y el algoritmo de firma.
2. **Payload (Carga útil)**: Contiene las declaraciones (claims) que definen los datos del usuario.
3. **Signature (Firma)**: Se crea usando el header y payload codificados, y una clave secreta del servidor.

```plaintext
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tYnJlIjoiYWRtaW4iLCJyb2wiOiJhZG1pbiIsImV4cCI6MTY5ODc3MTIwMH0.mK8zKO8yKJVYJmYo1TBYMqQpHtMZTw9bV_G7X6DLKPg
```

## Ejemplo de generación de tokens en Bash

Puedes generar y verificar un token JWT utilizando herramientas de línea de comandos como `openssl` para firmar el token.

### En Windows (PowerShell)
```bash
# Paso 1: Generar el Header en JSON y convertirlo a Base64
$jsonHeader = '{"alg":"HS256","typ":"JWT"}'
$base64Header = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($jsonHeader))

# Paso 2: Generar el Payload en JSON y convertirlo a Base64
$jsonPayload = '{"id":1,"nombre":"admin","rol":"admin"}'
$base64Payload = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($jsonPayload))

# Paso 3: Combinar Header y Payload
$tokenSinFirmar = "$base64Header.$base64Payload"

# Paso 4: Clave secreta para firmar el token
$secret = "claveSecretaParaJWT"

# Paso 5: Generar la firma usando HMAC-SHA256
# Utiliza OpenSSL para firmar el token
$signature = echo -n "$base64Header.$base64Payload" | openssl dgst -sha256 -hmac $secret -binary | openssl base64

# Paso 6: Crear el token firmado
$tokenFirmado = "$tokenSinFirmar.$signature"

# Paso 7: Mostrar el token firmado completo
echo "Token firmado completo: $tokenFirmado"
```

### En macOS/Linux (Bash)
```bash
# Generar payload (convertir a base64)
payload=$(echo -n '{"id":1,"nombre":"admin","rol":"admin"}' | openssl base64 -e)

# Firmar el token con openssl usando una clave secreta
header=$(echo -n '{"alg":"HS256","typ":"JWT"}' | openssl base64 -e)
secret="claveSecretaParaJWT"
signature=$(echo -n "$header.$payload" | openssl dgst -sha256 -hmac $secret)

# Resultado final del token
echo "$header.$payload.$signature"
```

