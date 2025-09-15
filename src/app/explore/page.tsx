
"use client";
import React from "react";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { Button } from "@/components/ui/button";

export default function ExplorePage() {
  return (
    <div className="h-screen w-full">
      <LayoutGrid cards={cards} />
    </div>
  );
}

const SkeletonOne = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        Responsive Navbar with Tailwind
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        A clean and responsive navigation bar that adapts to mobile screens, built with Tailwind CSS.
      </p>
      <Button>View Snippet</Button>
    </div>
  );
};

const SkeletonTwo = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        Python Web Scraper
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        A simple yet powerful web scraper built with Python and BeautifulSoup to extract data from websites.
      </p>
      <Button>View Snippet</Button>
    </div>
  );
};
const SkeletonThree = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        Async Data Fetching in Rust
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Learn how to perform asynchronous data fetching in Rust using the Tokio runtime and `reqwest` library.
      </p>
       <Button>View Snippet</Button>
    </div>
  );
};
const SkeletonFour = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        3D Scene with Three.js
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Create a stunning 3D scene with lighting, shadows, and interactive elements using Three.js and WebGL.
      </p>
       <Button>View Snippet</Button>
    </div>
  );
};

const cards = [
  {
    id: 1,
    content: <SkeletonOne />,
    className: "md:col-span-2",
    thumbnail:
      "https://picsum.photos/seed/explore1/600/400",
  },
  {
    id: 2,
    content: <SkeletonTwo />,
    className: "col-span-1",
    thumbnail:
      "https://picsum.photos/seed/explore2/600/400",
  },
  {
    id: 3,
    content: <SkeletonThree />,
    className: "col-span-1",
    thumbnail:
      "https://picsum.photos/seed/explore3/600/400",
  },
  {
    id: 4,
    content: <SkeletonFour />,
    className: "md:col-span-2",
    thumbnail:
      "https://picsum.photos/seed/explore4/600/400",
  },
];
