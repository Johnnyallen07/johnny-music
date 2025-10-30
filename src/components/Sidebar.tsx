"use client";
import { useState, useEffect } from "react";
import { ListMusic } from "lucide-react";

interface SidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ selectedCategory, setSelectedCategory, setIsOpen }: SidebarProps) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/category.json")
      .then((res) => res.json())
      .then((data: string[]) => setCategories(data));
  }, []);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setIsOpen(false);
  };

  return (
    <aside className="bg-gray-800 text-white w-64">
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-bold text-xl">
          类别
        </h2>
      </div>
      <nav className="mt-4">
        <ul>
          {categories.map((category) => (
            <li
              key={category}
              className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
                selectedCategory === category ? "bg-gray-700" : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              <ListMusic className="mr-4" />
              <span>
                {category}
              </span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
