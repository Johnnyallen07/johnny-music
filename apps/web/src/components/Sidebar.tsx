import { ListMusic, Music2, Users, Disc, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/LanguageContext';
import { CategoriesConfig } from "@johnny/api";
import { getCategoryIcon } from "@/utils/iconMapping";

interface SidebarProps {
  config: CategoriesConfig;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
}

export default function Sidebar({ config, selectedCategory, setSelectedCategory, setIsOpen, className }: SidebarProps) {
  const { t, language } = useLanguage();

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setIsOpen(false);
  };

  return (
    <aside className={cn("bg-background border-r flex flex-col h-full", className)}>
      <div className="p-6 flex items-center space-x-2 border-b">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <Music2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight">Johnny Music</span>
      </div>

      <div className="p-4 py-6">
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="space-y-6">

            {/* Main Categories */}
            <div>
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                {t('common.active_library') || 'Library'}
              </h3>
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === 'daily-recommendation' ? "secondary" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => handleCategoryClick('daily-recommendation')}
                >
                  <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                  {t('common.dailyRecommendation')}
                </Button>
                {config.categories.map((category) => {
                  const Icon = getCategoryIcon(category.en);
                  return (
                    category.id !== 'All Music' && (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "secondary" : "ghost"}
                        className="w-full justify-start font-normal"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {language === 'zh' ? category.zh : category.en}
                      </Button>
                    )
                  )
                })}
                <Button
                  variant={selectedCategory === 'All Music' ? "secondary" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => handleCategoryClick('All Music')}
                >
                  <ListMusic className="mr-2 h-4 w-4" />
                  {t('common.allMusic')}
                </Button>
              </div>
            </div>

            {/* Musicians */}
            {config.musicians && config.musicians.length > 0 && (
              <div>
                <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                  {t('common.musicians') || 'Musicians'}
                </h3>
                <div className="space-y-1">
                  {config.musicians.map((musician) => (
                    <Button
                      key={musician.id}
                      variant={selectedCategory === musician.id ? "secondary" : "ghost"}
                      className="w-full justify-start font-normal truncate"
                      onClick={() => handleCategoryClick(musician.id)}
                      title={language === 'zh' ? musician.zh : musician.en}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {language === 'zh' ? musician.zh : musician.en}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Series */}
            {config.series && config.series.length > 0 && (
              <div>
                <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                  {t('common.series') || 'Series'}
                </h3>
                <div className="space-y-1">
                  {config.series.map((series) => {
                    const SeriesIcon = getCategoryIcon(series.en);
                    return (
                      <Button
                        key={series.id}
                        variant={selectedCategory === series.id ? "secondary" : "ghost"}
                        className="w-full justify-start font-normal truncate"
                        onClick={() => handleCategoryClick(series.id)}
                        title={language === 'zh' ? series.zh : series.en}
                      >
                        <SeriesIcon className="mr-2 h-4 w-4" />
                        {language === 'zh' ? series.zh : series.en}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
