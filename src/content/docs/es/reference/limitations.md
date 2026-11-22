---
title: Limitaciones conocidas
description: Lo que Luvin todavía no hace.
sidebar:
  order: 4
---

Esto es lo que Luvin todavía no hace. Revísalo antes de planificar una prueba, para que una función que falta no te sorprenda.

- **Los pasos de mensajería se simulan.** Luvin todavía no se conecta a Kafka, AMQP ni MQTT; la app lo avisa antes de ejecutar.
- **Instaladores de escritorio sin firmar**, probados en macOS. Los de Windows y Linux aún no se han probado en esos sistemas.
- **gRPC** necesita el `.proto` (todavía sin server reflection) y los métodos de client-streaming y bidireccionales envían un solo mensaje.
- **Sin cabeceras propias en WebSocket** (Luvin abre la conexión como lo hace un navegador). Pasa el token en la URL, por ejemplo `?token={{token}}`.
- **Los pasos de un workflow envían campos del payload, no archivos.** Un paso con un body `multipart/form-data` se envía como multipart: cada campo del payload es una parte, una lista da una parte por elemento y un objeto se envía como JSON. Un paso no puede adjuntar un archivo. Los requests sueltos sí admiten archivos y bodies binarios: mira [Envía un archivo](/es/requests/send-files/).
- **Swagger UI solo para OpenAPI.** Los contratos AsyncAPI usan la vista previa propia de Luvin.
- **XPath 1.0.** Las funciones propias de XPath 2.0 o 3.0 no están disponibles.
- **Las pruebas de rendimiento salen de tu equipo.** La carga sale de esta máquina: hasta 500 usuarios virtuales y 60 minutos por prueba, con el límite de lo que tu equipo y tu red alcancen a enviar. Mira [Rendimiento](/es/runner/performance/).
- **Las pruebas de rendimiento solo miden la API real.** En **Simulación** no hay nada que medir. Para probar sin la API, apunta el ambiente a un mock server. En los workflows, la prueba repite un caso por workflow: el camino feliz entre los marcados, o el primero.
- **Los requests WebSocket no van en el runner.**
- **Todavía no hay versión alojada.** Ejecútalo en local, usa la app de escritorio o publica la compilación estática.

## Relacionado

- [Soporte de especificaciones](/es/reference/support/)
- [Instalar](/es/get-started/install/)
