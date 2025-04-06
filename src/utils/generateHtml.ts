export function generateHtml(redirectUrl) {
  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirecting...</title>
        <meta http-equiv="refresh" content="1;url=${redirectUrl}">
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
          }
          button {
            background-color: #888;
            color: white;
            padding: 20px 40px;
            font-size: 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          button:hover {
            background-color: #777;
          }
        </style>
      </head>
      <body>
        <button onclick="window.location.href='${redirectUrl}'">Back to App</button>
      </body>
      </html>
    `;
  return html;
}
