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

## To Do

- Connect to a SQL server and make data persistent.
- Configure the dockerfile to work with mariadb server.
- View the blog entries date wise
- Arrange by most recent, oldest, relevant(search)
- Implement a search engine(queries the server using a different protocol).
- Add the option to make posts private.
- Enable adding images to the text.
- In the future, markdown support.
- Improve the UI. Describe what the app is about in the home page.
- Make a sidebar which shows recent public posts. It can use socket io to communicate in different protocol, to update in realtime(not by page refresh)
