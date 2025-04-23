"use client";

import { Button } from "@heroui/button";

export default function SpinnerTest() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Button isLoading color="primary" size="md">
        Click me
      </Button>
    </div>
  );
}
