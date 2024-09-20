# Blog-Site

This is a simple blog website built using Node.js, Express.js, and EJS templating engine. It provides a platform for creating and managing blog posts with a clean and responsive user interface.

## Getting Started

I have also included a dockerfile which you can use to create an image and run a container.

### Installation and Running with npm

### Prerequisites

- Node.js (v14 or later recommended)
- npm (usually comes with Node.js)

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/blog-website.git
   cd blog-website
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the server:

   ```
   npm start
   ```

   The blog website should now be running at `http://localhost:8080`.

### Docker Instructions

#### Prerequisites

- Docker

1. Build the Docker image:

   ```
   docker build -t blog-website .
   ```

2. Run the Docker container:
   ```
   docker run -p 8080:8080 blog-website
   ```

After running these commands, you can access the blog website by opening a web browser and navigating to `http://localhost:8080`.
