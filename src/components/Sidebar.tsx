"use client";
import { ListMusic } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ categories, selectedCategory, setSelectedCategory, setIsOpen }: SidebarProps) {

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setIsOpen(false);
  };

  return (
    <aside className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white h-full flex flex-col">
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <h2 className="font-bold text-xl">
        </h2>
      </div>
      <nav className="mt-4 flex-grow overflow-y-auto">
        <ul>
          {categories.map((category) => (
            <li
              key={category.id}
              className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                selectedCategory === category.name ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <ListMusic className="mr-4" />
              <span>
                {category.name}
              </span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
