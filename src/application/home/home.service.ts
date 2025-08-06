import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
  getHome(): string {
    if (process.env.NODE_ENV !== 'production') {
      return `
        <html>
          <head>
            <title>Home</title>
          </head>
          <body>
            <h1>Welcome to the API</h1>
            <p>You are running in development mode.</p>
            <ul>
              <li><a href="/reference">Scalar</a></li>
            </ul>
          </body>
        </html>
      `;
    } else {
      return `
        <html>
          <head>
            <title>Error</title>
            <style>
              .alert {
                padding: 20px;
                background-color: #f44336;
                color: white;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="alert">
              <strong>Error:</strong> You have accessed the wrong site.
            </div>
          </body>
        </html>
      `;
    }
  }
}
