"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loadGeneratedSiteFromFirebase, saveGeneratedSiteToFirebase, GeneratedSite } from "@/services/firebase";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui";
import {
  ArrowLeftIcon,
  FolderIcon,
  DocumentIcon,
  CheckCircleIcon,
  XMarkIcon,
  XCircleIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { registerCustomBlocks } from "./customBlocks";
import { registerEcommerceBlocks } from "./ecommerceBlocks";
import {
  deletePageSetting,
  getPageSettingsByStorefront,
  updatePageSetting,
  createDefaultPageSettings,
  ensureAllPagesHaveSettings,
  PageSetting
} from "@/services/pageSettings";
import "grapesjs/dist/css/grapes.min.css";
// Note: GrapesJS should be imported dynamically in useEffect to avoid SSR issues

interface PageEditorProps {
  subdomain?: string;
  initialPage?: string;
}

/**
 * Recursive Menu Item for hierarchical drag and drop
 */
const NestedMenuItem: React.FC<{
  setting: PageSetting;
  allSettings: PageSetting[];
  onToggle: (id: string, field: 'enabled' | 'showInMenu', value: boolean) => void;
  onMove: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  depth?: number;
}> = ({ setting, allSettings, onToggle, onMove, depth = 0 }) => {
  const [isOver, setIsOver] = useState<'before' | 'after' | 'inside' | null>(null);
  const children = allSettings.filter(s => s.parentId === setting.id).sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", setting.id);
    e.dataTransfer.effectAllowed = "move";
    // Set a class on the body to style the dragged item globally if needed
    document.body.classList.add("dragging-menu-item");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (y < rect.height * 0.25) {
      setIsOver('before');
    } else if (y > rect.height * 0.75) {
      setIsOver('after');
    } else {
      setIsOver('inside');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId === setting.id) {
      setIsOver(null);
      return;
    }

    if (isOver) {
      onMove(draggedId, setting.id, isOver);
    }
    setIsOver(null);
  };

  return (
    <div className="space-y-1">
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsOver(null)}
        onDrop={handleDrop}
        onDragEnd={() => document.body.classList.remove("dragging-menu-item")}
        className={`relative p-3 rounded-xl border transition-all cursor-move group ${isOver === 'inside' ? 'bg-blue-50 border-blue-400 scale-[1.02] shadow-md z-10' :
          isOver === 'before' ? 'border-t-blue-500 border-t-2 bg-gray-50' :
            isOver === 'after' ? 'border-b-blue-500 border-b-2 bg-gray-50' :
              'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
          }`}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-blue-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 uppercase tracking-tighter block">{setting.settings.metaTitle || setting.pageType}</span>
              <span className="text-[10px] text-gray-400 font-mono tracking-tighter">{setting.route}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle(setting.id, 'showInMenu', !setting.settings.showInMenu)}
              className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${setting.settings.showInMenu ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              title="Show in Menu"
            >
              {setting.settings.showInMenu ? 'In Menu' : 'Hidden'}
            </button>
            <div className={`w-2 h-2 rounded-full ${setting.settings.enabled ? 'bg-green-500' : 'bg-gray-300 shadow-inner'}`} title={setting.settings.enabled ? 'Live' : 'Draft'} />
          </div>
        </div>

        {/* Nesting Indicator */}
        {isOver === 'inside' && (
          <div className="absolute -bottom-2 right-4 bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg animate-bounce">
            Make Child
          </div>
        )}
      </div>

      {/* Recursive Children */}
      {children.length > 0 && (
        <div className="space-y-1">
          {children.map(child => (
            <NestedMenuItem
              key={child.id}
              setting={child}
              allSettings={allSettings}
              onToggle={onToggle}
              onMove={onMove}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PageEditor: React.FC<PageEditorProps> = ({ subdomain, initialPage = "homepage" }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editor, setEditor] = useState<any>(null);
  const [siteData, setSiteData] = useState<GeneratedSite | null>(null);
  const [currentPage, setCurrentPage] = useState<string>(initialPage);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"blocks" | "styles" | "layers" | "pages" | "settings">("blocks");
  const [pageSettings, setPageSettings] = useState<PageSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Drag and drop state for menu reordering
  const [dragId, setDragId] = useState<string | null>(null);

  // Re-render blocks when the tab becomes active
  useEffect(() => {
    if (editor && activeTab === "blocks") {
      setTimeout(() => {
        editor.BlockManager.render();
        const bmContainer = document.getElementById('blocks-container');
        if (bmContainer) {
          const firstCat = bmContainer.querySelector('.gjs-category');
          if (firstCat && !firstCat.classList.contains('gjs-open')) {
            firstCat.classList.add('gjs-open');
          }
        }
      }, 100);
    }
  }, [activeTab, editor]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load site data from Firebase
  const loadSiteData = async (isRetry: boolean = false) => {
    if (!user || !isAuthenticated) {
      setError("Not authenticated. Please sign in to access the editor.");
      setLoading(false);
      // Don't redirect - let user see the error and navigate manually
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Loading site data from Firebase...", { userId: user.user_id || (user as any).uid, isRetry });

      const site = await loadGeneratedSiteFromFirebase(user);

      if (!site) {
        // Check if it's likely a Firebase offline issue vs. no storefront
        const isLikelyOffline = retryCount === 0; // First attempt suggests offline
        if (isLikelyOffline) {
          setError("Unable to connect to Firebase. Please check your internet connection.");
        } else {
          setError("No storefront found. Please create a storefront first.");
        }
        setLoading(false);
        // Don't redirect immediately - let user see the error and retry option
        return;
      }

      console.log("✅ Site data loaded:", {
        companyName: site.companyName,
        subdomain: site.subdomain,
        pagesCount: Object.keys(site.pages || {}).length
      });

      setSiteData(site);
      setError(null);
      setLoading(false);

      // Set initial page if provided
      if (initialPage && site.pages[initialPage]) {
        setCurrentPage(initialPage);
      } else if (site.pages && Object.keys(site.pages).length > 0) {
        // Use first available page if initialPage not found
        const firstPage = Object.keys(site.pages)[0];
        setCurrentPage(firstPage);
      }
    } catch (error: any) {
      console.error("❌ Error loading site:", error);
      setError(error.message || "Failed to load storefront");
      showError("Failed to load storefront. Please try again.");
      setLoading(false);
    }
  };

  // Load page settings
  const loadPageSettings = async () => {
    if (!subdomain || !user) return;
    try {
      setSettingsLoading(true);
      // Pass false to include disabled pages
      let settings = await getPageSettingsByStorefront(subdomain, false);

      // Ensure all actual pages have settings
      if (siteData) {
        const availablePages = Object.keys(siteData.pages);
        const userId = user.user_id?.toString() || (user as any).uid || "";
        await ensureAllPagesHaveSettings(subdomain, userId, availablePages);
        // Refresh settings after sync
        settings = await getPageSettingsByStorefront(subdomain, false);
      }

      setPageSettings(settings);
    } catch (error) {
      console.error("Error loading page settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    loadSiteData();
    loadPageSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  // Initialize GrapesJS editor
  useEffect(() => {
    // Wait for siteData to load
    if (!siteData || loading) {
      return;
    }

    let editorInstance: any = null;
    let isMounted = true;

    // Use a small delay to ensure DOM is ready and container ref is set
    const initTimer = setTimeout(() => {
      // Check if container exists after delay
      if (!containerRef.current) {
        console.error("Container ref is null - editor container not found in DOM");
        showError("Editor container not found. Please refresh the page.");
        return;
      }

      const container = containerRef.current;

      // Import GrapesJS modules dynamically
      Promise.all([
        import("grapesjs"),
        import("grapesjs-preset-webpage"),
        import("grapesjs-blocks-basic"),
      ]).then(([GrapesJS, gjsPresetWebpage, gjsBlocksBasic]) => {
        // Check if component is still mounted and container still exists
        if (!isMounted || !containerRef.current) {
          console.warn("Component unmounted or container removed before GrapesJS initialization");
          return;
        }

        try {
          editorInstance = GrapesJS.default.init({
            container: containerRef.current,
            height: "100%",
            width: "100%",
            storageManager: false, // We'll handle saving manually
            fromElement: true,
            canvas: {
              styles: [
                "https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css",
                "https://fold-html.netlify.app/assets/css/global.css"
              ],
              scripts: [
                "https://cdn.tailwindcss.com"
              ]
            },
            plugins: [
              gjsPresetWebpage.default,
              gjsBlocksBasic.default,
            ],
            pluginsOpts: {
              [gjsPresetWebpage.default]: {
                modalImportTitle: "Import Template",
                modalImportLabel: "<div style='margin-bottom: 10px; font-size: 13px;'>Paste here your HTML/CSS and click Import</div>",
                modalImportContent: (editor: any) => {
                  const textarea = document.createElement("textarea");
                  textarea.value = `<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-4">Your Content</h1>
  <p class="text-gray-600">Start editing...</p>
</div>`;
                  return textarea;
                },
              },
            },
            blockManager: {
              // We will append this manually after init to ensure container exists
            },
            layerManager: {
              appendTo: "#layers-container",
            },
            styleManager: {
              appendTo: "#styles-container",
              sectors: [
                {
                  name: "Background",
                  open: true,
                  properties: [
                    { name: "Background Image", property: "background-image" },
                    { name: "Size", property: "background-size" },
                    { name: "Position", property: "background-position" },
                    { name: "Repeat", property: "background-repeat" },
                    { name: "Attachment", property: "background-attachment" },
                  ]
                },
                {
                  name: "Dimensions",
                  open: false,
                  buildProps: ["width", "height", "min-height", "padding", "margin"],
                },
                {
                  name: "Typography",
                  open: false,
                  buildProps: ["font-family", "font-size", "font-weight", "letter-spacing", "color", "line-height", "text-align"],
                },
                {
                  name: "Tailwind Classes",
                  open: true,
                  buildProps: ["class"],
                },
              ],
            },
            deviceManager: {
              devices: [
                {
                  name: "Desktop",
                  width: "",
                },
                {
                  name: "Tablet",
                  width: "768px",
                  widthMedia: "992px",
                },
                {
                  name: "Mobile",
                  width: "320px",
                  widthMedia: "768px",
                },
              ],
            },
          });

          // Register custom blocks
          registerCustomBlocks(editorInstance);
          registerEcommerceBlocks(editorInstance);

          // Load initial page content
          if (siteData.pages[currentPage]) {
            const page = siteData.pages[currentPage];
            editorInstance.setComponents(page.html);
            editorInstance.setStyle(page.css);
          }

          // Listen for editor updates to auto-save
          editorInstance.on("update", () => {
            if (!siteData || !currentPage) return;
            // Auto-save logic could go here
          });

          // Handle collapsible categories
          editorInstance.on('load', () => {
            const categories = editorInstance.BlockManager.getCategories();
            categories.each((cat: any, index: number) => {
              cat.set('open', index === 0); // Open the first category by default
            });
          });

          // Add click listener and initial render
          setTimeout(() => {
            const bmContainer = document.getElementById('blocks-container');
            if (bmContainer && editorInstance) {
              const bm = editorInstance.BlockManager;
              const bmView = bm.getContainer();
              if (!bmContainer.contains(bmView)) {
                bmContainer.appendChild(bmView);
              }
              bm.render();

              console.log("🛠️ Block Manager initialized and rendered");
              // Force first category open visually
              const firstCat = bmContainer.querySelector('.gjs-category');
              if (firstCat) firstCat.classList.add('gjs-open');

              // Delegate click events for collapsibility
              if (!bmContainer.hasAttribute('data-listener-attached')) {
                bmContainer.addEventListener('click', (e: any) => {
                  const title = e.target.closest('.gjs-category-title');
                  if (title) {
                    const category = title.closest('.gjs-category');
                    if (category) {
                      category.classList.toggle('gjs-open');
                    }
                  }
                });
                bmContainer.setAttribute('data-listener-attached', 'true');
              }
            }
          }, 1000);

          if (isMounted) {
            setEditor(editorInstance);
            editorRef.current = editorInstance;
          }
        } catch (initError: any) {
          console.error("Error initializing GrapesJS:", initError);
          if (isMounted) {
            const errorMessage = initError.message || "Failed to initialize editor";
            if (errorMessage.includes("Content Security Policy") || errorMessage.includes("eval")) {
              showError("Editor requires additional permissions. Please check browser settings or contact support.");
            } else {
              showError("Failed to initialize editor. Redirecting to dashboard...");
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);
            }
          }
        }
      }).catch((error) => {
        console.error("Error loading GrapesJS modules:", error);
        if (isMounted) {
          showError("Failed to load editor. Redirecting to dashboard...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      });
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      isMounted = false;
      if (initTimer) {
        clearTimeout(initTimer);
      }
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          console.error("Error destroying editor:", error);
        }
        editorRef.current = null;
        setEditor(null);
      }
    };
  }, [siteData, loading, showError]);

  // Handle page change
  const handlePageChange = (pageName: string) => {
    if (!editor || !siteData || !siteData.pages[pageName]) return;

    // Save current page before switching
    if (siteData.pages[currentPage]) {
      const html = editor.getHtml();
      const css = editor.getCss();

      setSiteData({
        ...siteData,
        pages: {
          ...siteData.pages,
          [currentPage]: {
            ...siteData.pages[currentPage],
            html,
            css,
          },
        },
      });
    }

    // Load new page
    const newPage = siteData.pages[pageName];
    editor.setComponents(newPage.html);
    editor.setStyle(newPage.css);
    setCurrentPage(pageName);

    // Refresh block manager state if needed
    setTimeout(() => {
      editor.BlockManager.render();
    }, 100);
  };

  // Save page to Firebase
  const handleSave = async () => {
    if (!editor || !siteData || !user) return;

    try {
      setSaving(true);

      // Get current HTML and CSS
      const html = editor.getHtml();
      const css = editor.getCss();

      // Update site data
      const updatedSite: GeneratedSite = {
        ...siteData,
        pages: {
          ...siteData.pages,
          [currentPage]: {
            ...siteData.pages[currentPage],
            html,
            css,
          },
        },
      };

      // Save to Firebase
      await saveGeneratedSiteToFirebase(updatedSite, user);

      setSiteData(updatedSite);
      showSuccess("Page saved successfully!");
    } catch (error) {
      console.error("Error saving page:", error);
      showError("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  // Toggle page setting
  const handleToggleSetting = async (id: string, field: 'enabled' | 'showInMenu', value: boolean) => {
    try {
      const current = pageSettings.find(s => s.id === id);
      if (!current) return;

      const updatedSettings = {
        ...current.settings,
        [field]: value
      } as any;

      await updatePageSetting(id, {
        settings: updatedSettings
      });

      // Update local state
      setPageSettings(prev => prev.map(s =>
        s.id === id ? { ...s, settings: updatedSettings } : s
      ));
      showSuccess("Setting updated!");
    } catch (error) {
      console.error("Error updating setting:", error);
      showError("Failed to update setting");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading editor...</p>
        <p className="text-sm text-gray-500 mt-2">Fetching storefront data...</p>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Unable to Load Editor"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.includes("connect") || error?.includes("offline") || error?.includes("Unable to connect")
              ? "Unable to connect to Firebase. This is usually due to network connectivity issues. Please check your internet connection and try again."
              : error
                ? error
                : "No storefront found. Please create a storefront first."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setRetryCount(prev => prev + 1);
                loadSiteData(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              loading={loading}
            >
              {retryCount > 0 ? `Retry (${retryCount})` : "Retry"}
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="bordered"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Go to Dashboard
            </Button>
          </div>
          {error && (
            <p className="text-xs text-gray-500 mt-4">
              If this persists, check your internet connection and Firebase configuration.
            </p>
          )}
        </div>
      </div>
    );
  }

  const pages = Object.keys(siteData.pages || {});

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <style>{`
        .gjs-blocks-c, .gjs-sm-c, .gjs-layers-c {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 8px !important;
          padding: 10px !important;
          background: transparent !important;
        }
        #blocks-container, #styles-container, #layers-container {
          min-height: 100% !important;
          padding-bottom: 40px !important;
        }
        /* Style Manager and Layers should be single column, only Blocks is 3-column */
        .gjs-sm-c, .gjs-layers-c {
          display: block !important;
        }
        .gjs-block {
          width: auto !important;
          min-height: 80px !important;
          color: white !important;
          border: 1px solid #efefef !important;
          padding: 8px !important;
          margin: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 4px !important;
        }
        .gjs-block:hover {
          border-color: #6366f1 !important;
          background: rgba(99, 102, 241, 0.2) !important;
          transform: translateY(-1px) !important;
        }
        .gjs-block-label, .gjs-block svg {
          color: white !important;
          fill: white !important;
          font-size: 13px !important;
          text-align: center !important;
          word-break: break-all !important;
          font-weight: 600 !important;
        }
        /* SECTION TITLES: Bold and White */
        .gjs-category-title, .gjs-sm-sector-title, .gjs-sm-title {
          background-color: #111827 !important;
          color: white !important;
          font-weight: 800 !important;
          padding: 10px 12px !important;
          margin: 12px 0 6px 0 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 2px solid rgba(255,255,255,0.2) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          cursor: pointer !important;
        }
        .gjs-category-title::after {
          content: '▼';
          font-size: 8px;
          transition: transform 0.3s ease;
        }
        .gjs-category.gjs-open .gjs-category-title::after {
          transform: rotate(-180deg);
        }
        /* Ensure categories are visible if they have the open class */
        .gjs-category:not(.gjs-open) .gjs-blocks-c {
          display: none !important;
        }
        .gjs-category.gjs-open .gjs-blocks-c {
          display: grid !important;
        }
        .gjs-blocks-c {
          transition: all 0.3s ease-out !important;
        }
        /* Style Manager Inner Labels */
        .gjs-sm-label, .gjs-sm-field, .gjs-sm-property {
          color: #e5e7eb !important;
        }
      `}</style>
      {/* Top Toolbar */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm transition-all"
            size="sm"
          >
            <ArrowLeftIcon className="w-4 h-4 font-bold" />
            Dashboard
          </Button>

          <h1 className="text-lg font-semibold text-gray-800">
            Editing: {siteData.companyName}
          </h1>

          <div className="flex items-center bg-gray-100/50 p-1 rounded-xl border border-gray-200">
            <Button
              onClick={() => {
                setActiveTab("pages");
                setRightPanelOpen(true);
              }}
              variant="bordered"
              size="sm"
              className={`min-w-[100px] flex items-center justify-center gap-2 transition-all rounded-lg border-none ${activeTab === "pages" && rightPanelOpen ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
            >
              <FolderIcon className="w-4 h-4" />
              <span>Pages</span>
            </Button>

            <Button
              onClick={() => {
                setActiveTab("blocks");
                setRightPanelOpen(true);
              }}
              variant="bordered"
              size="sm"
              className={`min-w-[100px] flex items-center justify-center gap-2 transition-all rounded-lg border-none ${activeTab === "blocks" && rightPanelOpen ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
              </svg>
              <span>Blocks</span>
            </Button>

            <Button
              onClick={() => {
                setActiveTab("settings");
                setRightPanelOpen(true);
              }}
              variant="bordered"
              size="sm"
              className={`min-w-[100px] flex items-center justify-center gap-2 transition-all rounded-lg border-none ${activeTab === "settings" && rightPanelOpen ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Current: {currentPage}
          </span>
          <Button
            onClick={handleSave}
            isDisabled={saving}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            {saving ? "Saving..." : "Save Page"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Canvas - Maximum Width */}
        <div className="flex-1 relative flex flex-col h-full overflow-hidden">
          <div ref={containerRef} className="flex-1 bg-white" />

          {/* Floating Save Button */}
          <div className="absolute bottom-8 right-8 z-40 group">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Save changes to Cloud
            </div>
            <Button
              onClick={handleSave}
              isDisabled={saving}
              className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center p-0 transition-all transform hover:scale-110 active:scale-95 ${saving ? "bg-gray-400" : "bg-primary-500 hover:bg-primary-600"
                }`}
            >
              {saving ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CloudArrowUpIcon className="w-7 h-7 text-white" />
              )}
            </Button>
          </div>
        </div>

        {/* Right Sidebar - Tabbed Panel */}
        <div className={`relative transition-all duration-300 ease-in-out ${rightPanelOpen ? "w-96" : "w-0"
          } bg-white border-l border-gray-200 shadow-xl flex flex-col z-30`}>

          {/* Dedicated Toggle Handle - Circular and Always Visible */}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`absolute top-1/2 -translate-y-1/2 -left-7 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all z-50 hover:scale-110 active:scale-95`}
            title={rightPanelOpen ? "Collapse Panel" : "Expand Panel"}
          >
            <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${rightPanelOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="w-96 h-full flex flex-col overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
              <button
                onClick={() => setActiveTab("blocks")}
                className={`flex-1 px-2 py-3 text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${activeTab === "blocks"
                  ? "bg-white text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                title="Blocks"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                </svg>
                <span className="scale-90">Blocks</span>
              </button>
              <button
                onClick={() => setActiveTab("styles")}
                className={`flex-1 px-2 py-3 text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${activeTab === "styles"
                  ? "bg-white text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                title="Styles"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="scale-90">Styles</span>
              </button>
              <button
                onClick={() => setActiveTab("layers")}
                className={`flex-1 px-2 py-3 text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${activeTab === "layers"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                title="Layers"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span className="scale-90">Layers</span>
              </button>
              <button
                onClick={() => setActiveTab("pages")}
                className={`flex-1 px-2 py-3 text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${activeTab === "pages"
                  ? "bg-white text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                title="Pages"
              >
                <FolderIcon className="w-4 h-4" />
                <span className="scale-90">Pages</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 px-2 py-3 text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${activeTab === "settings"
                  ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                title="Settings"
              >
                <Cog6ToothIcon className="w-4 h-4" />
                <span className="scale-90">Settings</span>
              </button>
            </div>

            {/* Tab Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Blocks Tab */}
              <div id="blocks-container" className={`p-4 ${activeTab === "blocks" ? "" : "hidden"}`}></div>

              {/* Styles Tab */}
              <div id="styles-container" className={`p-4 ${activeTab === "styles" ? "" : "hidden"}`}></div>

              {/* Layers Tab */}
              <div id="layers-container" className={`p-4 ${activeTab === "layers" ? "" : "hidden"}`}></div>

              {/* Pages Tab */}
              <div className={`p-4 ${activeTab === "pages" ? "" : "hidden"}`}>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FolderIcon className="w-5 h-5 text-orange-600" />
                  Your Pages
                </h3>
                <div className="space-y-2">
                  {pages.map((pageName) => (
                    <button
                      key={pageName}
                      onClick={() => handlePageChange(pageName)}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${currentPage === pageName
                        ? "bg-orange-50 text-orange-700 border-2 border-orange-200 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 border-2 border-transparent"
                        }`}
                    >
                      <DocumentIcon className="w-5 h-5" />
                      <span className="capitalize font-medium">{pageName.replace(/-/g, " ")}</span>
                      {currentPage === pageName && (
                        <CheckCircleIcon className="w-5 h-5 ml-auto text-orange-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Tab */}
              <div className={`p-4 ${activeTab === "settings" ? "" : "hidden"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Cog6ToothIcon className="w-5 h-5 text-blue-600" />
                    Storefront Settings
                  </h3>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={loadPageSettings}
                    className="text-gray-400 hover:text-gray-600"
                    isDisabled={settingsLoading}
                  >
                    Refresh
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-1">Navigation Menu</h4>
                    <p className="text-[10px] text-blue-600 font-medium font-mono leading-tight">DRAG TO REORDER. DRAG OVER TO NEST.</p>
                  </div>

                  <div className="space-y-2">
                    {pageSettings.filter(s => !s.parentId).sort((a, b) => (a.order || 0) - (b.order || 0)).map((setting) => (
                      <NestedMenuItem
                        key={setting.id}
                        setting={setting}
                        allSettings={pageSettings}
                        onToggle={handleToggleSetting}
                        onMove={async (draggedId, targetId, position) => {
                          const dragged = pageSettings.find(s => s.id === draggedId);
                          if (!dragged) return;

                          let newParentId: string | null = null;
                          let newOrder = 0;

                          if (position === 'inside') {
                            newParentId = targetId;
                            const siblings = pageSettings.filter(s => s.parentId === targetId);
                            newOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order || 0)) + 1 : 0;
                          } else {
                            const target = pageSettings.find(s => s.id === targetId);
                            newParentId = target?.parentId || null;
                            if (position === 'before') {
                              newOrder = (target?.order || 0) - 0.5;
                            } else {
                              newOrder = (target?.order || 0) + 0.5;
                            }
                          }

                          try {
                            setSettingsLoading(true);
                            await updatePageSetting(draggedId, {
                              parentId: newParentId,
                              order: newOrder
                            });
                            await loadPageSettings();
                            showSuccess("Menu updated");
                          } catch (error) {
                            showError("Failed to move item");
                            console.error(error);
                          } finally {
                            setSettingsLoading(false);
                          }
                        }}
                      />
                    ))}

                    {pageSettings.length === 0 && !settingsLoading && (
                      <div className="p-8 text-center text-gray-400 text-xs italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        No pages found.
                      </div>
                    )}

                    {settingsLoading && (
                      <div className="space-y-2 animate-pulse mt-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-12 bg-gray-100 rounded-xl w-full" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
