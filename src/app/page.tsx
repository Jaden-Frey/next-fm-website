import React from 'react';

export default function Home() {
  return (
    <>
      {/* Hero Section based on theme's index.html */}
      <header className="bg-primary bg-gradient text-white">
        <div className="container px-4 text-center">
          <h1 className="fw-bolder">Welcome to Scrolling Nav</h1>
          <p className="lead">A functional Bootstrap 5 boilerplate for one page scrolling websites</p>
          <a className="btn btn-lg btn-light" href="#about">Start scrolling!</a>
        </div>
      </header>

      {/* About Section */}
      <section id="about">
        <div className="container px-4">
          <div className="row gx-4 justify-content-center">
            <div className="col-lg-8">
              <h2>About this page</h2>
              <p className="lead">This is a great place to talk about your webpage. This template is purposfully unstyled so you can use it as a boilerplate or starting point for your own landing page designs! This template features:</p>
              <ul>
                <li>Clickable nav links that smooth scroll to page sections</li>
                <li>Responsive behavior when clicking nav links perfect for a "One Page" website</li>
                <li>Bootstrap's scrollspy feature which highlights which section of the page you're on in the navbar</li>
                <li>Minimal custom CSS so you are free to explore your own unique design options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}