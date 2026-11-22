---
title: Soporte de especificaciones
description: Qué soporta Luvin de Arazzo 1.0 y 1.1, OpenAPI 3.x y AsyncAPI 2.x y 3.x.
sidebar:
  order: 3
---

Luvin trabaja con **Arazzo 1.0 y 1.1**, **OpenAPI 3.x** y **AsyncAPI 2.x y 3.x**.

| Característica | Estado |
|---|---|
| `operationId` (simple y `$sourceDescriptions.x.opId`) | Soportado |
| `operationPath` | Soportado |
| Pasos con `workflowId` (sub-workflows) | Soportado, de este archivo o de otro archivo Arazzo (`$sourceDescriptions.<fuente>.<workflowId>`, fuente de `type: arazzo`) |
| Parámetros de ruta, query y cabecera | Soportado |
| Parámetros `in: querystring` (1.1) | Soportado |
| `requestBody` con `payload` y `replacements` | Soportado (JSON Pointer, JSONPath y XPath sobre payloads XML) |
| Tipos de contenido de `requestBody` en pasos de workflow | JSON, `application/x-www-form-urlencoded`, `multipart/form-data` (solo campos del payload, sin archivos) y texto plano |
| `successCriteria`: simple, regex y JSONPath | Soportado (sintaxis de jsonpath-plus) |
| `successCriteria` y selectores: XPath | XPath 1.0 sobre respuestas XML |
| `onSuccess` / `onFailure`: `end`, `goto`, `retry` | Soportado. `goto` y `retry` aceptan `stepId` o `workflowId`, también de otro archivo Arazzo. `retry` con `stepId` ejecuta ese paso una vez antes de cada reintento |
| `parameters` en acciones de éxito y de fallo (1.1) | Soportado para `goto` y `retry` con `workflowId` |
| Selector Object en outputs, parámetros y payloads (1.1) | Soportado (JSONPath, JSON Pointer y XPath) |
| `components` (parameters, successActions, failureActions, inputs) | Soportado |
| Fuentes AsyncAPI (1.1): `channelPath`, `action`, `correlationId`, `$message` | Soportado, siempre simulado |
| `timeout` del paso (1.1) | Soportado |
| `dependsOn` del paso (1.1) | Se revisa en el análisis y antes de cada paso; los pasos corren en el orden del documento |
| `dependsOn` del workflow | Las dependencias corren primero (una vez por ejecución) y sus outputs quedan disponibles como `$workflows.<id>.outputs`; se detectan ciclos. Puede nombrar un workflow de otro archivo Arazzo de la colección (`$sourceDescriptions.<fuente>.<workflowId>`) |
| `$ref` externos en archivos OpenAPI, AsyncAPI y Arazzo | Entre archivos cargados, y junto a un contrato descargado desde su URL |

## Relacionado

- [Limitaciones conocidas](/es/reference/limitations/)
- [Los ejemplos incluidos](/es/reference/examples/)
