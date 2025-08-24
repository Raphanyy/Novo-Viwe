import React, { useRef } from "react";
import HomePage from "./HomePage";
import ThreeJSWrapper from "../components/ThreeJSWrapper";

const Index: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <ThreeJSWrapper>
      <HomePage heroRef={heroRef} />
    </ThreeJSWrapper>
  );
};

export default Index;
