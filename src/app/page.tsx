"use client";
import React, { ChangeEvent, useState } from 'react';

export default function Home() {
  const [image, setImage] = useState<File>();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if(e.target.files) {
      setImage(e.target.files[0]);
    }
  } 

  const onSubmit = async () => {
    if (!image) {
      alert("Please select an image to upload");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("/api/upload-image", {  
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      console.log("Upload success:", data);
      alert("Upload successful!");

    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  }

  return (
    <>
      <header className="bg-primary bg-gradient text-white">
        <div className="container px-4 text-center">
          <h1 className="fw-bolder">Welcome to Scrolling Nav</h1>
          <p className="lead">A functional Bootstrap 5 boilerplate for one page scrolling websites</p>
          <a className="btn btn-lg btn-light" href="#about">Start scrolling!</a>
        </div>
      </header>

      <section id="upload" className="py-5">
        <div className="container px-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              
              <div className="mb-3">
                <div className="w-100">
                  <input 
                    className="form-control" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button onClick={onSubmit}
              className="btn btn-dark text-white fw-bold py-2 px-3 rounded">
                Upload Image
              </button>

              <div className="mt-4">
                <h1 className="fw-bold fs-2">All Foods</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

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