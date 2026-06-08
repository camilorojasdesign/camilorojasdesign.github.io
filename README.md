# Camilo Rojas Portfolio — MVP

Sitio estático listo para publicarse gratuitamente con GitHub Pages en:

**https://camilorojas.design**

## Incluye

- Home responsive.
- Posicionamiento profesional.
- ForumGo, PagoConectado y Subtrack.
- Capacidades, perfil y contacto.
- Navegación móvil.
- Accesibilidad básica y reducción de movimiento.
- SEO, Open Graph, sitemap, robots, favicon y página 404.
- Archivo `CNAME` con `camilorojas.design`.

## Datos aplicados

- Nombre: Camilo Rojas.
- Correo: hola@camilorojas.design.
- Dominio: camilorojas.design.
- LinkedIn: https://www.linkedin.com/in/camilorojasduque

Verifica la URL de LinkedIn antes de publicar.

## Publicación rápida

1. Crea un repositorio público en GitHub llamado `TU-USUARIO.github.io`.
2. Sube todos los archivos y carpetas de este paquete a la raíz.
3. Ve a `Settings → Pages`.
4. Selecciona `Deploy from a branch`.
5. Selecciona la rama `main` y la carpeta `/ (root)`.
6. Guarda y espera la URL temporal de GitHub Pages.
7. Comprueba el sitio antes de modificar el DNS.
8. En `Settings → Pages → Custom domain`, escribe `camilorojas.design`.

## Regla crítica para Google Workspace

Al configurar el dominio en Squarespace Domains, modifica solo los registros web que indique GitHub. No borres MX, SPF, DKIM, DMARC ni verificaciones de Google.

## Añadir el CV

Copia tu PDF definitivo en:

`assets/documents/Camilo_Rojas_CV_UXUI_Product_ES.pdf`

Después añade este enlace dentro de `index.html`:

```html
<a class="btn secondary"
   href="/assets/documents/Camilo_Rojas_CV_UXUI_Product_ES.pdf"
   download>
  Descargar CV
</a>
```

## Siguiente iteración

- Crear una página completa para ForumGo.
- Duplicar la estructura para PagoConectado y Subtrack.
- Integrar imágenes finales exportadas desde Figma.
- Añadir el CV definitivo.
