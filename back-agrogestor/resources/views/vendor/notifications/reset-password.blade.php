@component('mail::message')
# ¡Hola!

Desde AGROGESTOR Recibimos tu petición de restablecer la contraseña.  
Haz clic en el botón de abajo para crear una nueva:

@component('mail::button', ['url' => $actionUrl])
¡Crea tu nueva contraseña!
@endcomponent

Si tú no solicitaste este cambio, puedes ignorar este correo.  

Un saludo,  
{{ config('app.name') }}
@endcomponent
