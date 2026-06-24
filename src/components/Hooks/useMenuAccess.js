import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { getRolePermission } from "../../API/rolePermission";

// Cache menu access data to avoid multiple API calls
let menuAccessCache = null;
let menuPathMapCache = null; // Map of path -> menuId
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Event name for cache invalidation
const CACHE_INVALIDATION_EVENT = 'menuAccessCacheInvalidated';

/**
 * Custom hook to get menu access permissions based on current route
 * Automatically detects menuId from current pathname
 * @param {number} menuId - Optional: If provided, uses this menuId directly. Otherwise detects from route
 * @returns {object} - { canDelete, canEdit, canCreate, isLoading, menuId }
 */
const useMenuAccess = (menuId = null) => {
  const location = useLocation();
  const [menuAccess, setMenuAccess] = useState({
    canDelete: false,
    canEdit: false,
    canCreate: false,
    isLoading: true,
    menuId: null,
  });

  useEffect(() => {
    const fetchMenuAccess = async (forceRefresh = false) => {
      try {
        // Check cache first (unless force refresh)
        const now = Date.now();
        let menuAccessArray = [];
        let pathMap = {};

        if (!forceRefresh && menuAccessCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
          menuAccessArray = menuAccessCache;
          pathMap = menuPathMapCache;
        } else {
          // Fetch from API if cache is invalid
          const userRole = Cookies.get("userRole");
          if (userRole) {
            const response = await getRolePermission(userRole);
            console.log("API Response:", response);
            if (response?.data) {
              const apiData = response.data;
              console.log("API Data:", apiData);
              
              if (apiData?.SelectedMenuAccess && Array.isArray(apiData.SelectedMenuAccess)) {
                menuAccessArray = apiData.SelectedMenuAccess;
                console.log("Using SelectedMenuAccess:", menuAccessArray);
              } else if (Array.isArray(apiData)) {
                menuAccessArray = apiData;
                console.log("Using direct array:", menuAccessArray);
              } else {
                console.log("Unexpected API data structure:", apiData);
              }
              
              // Build path to menuId map
              pathMap = {};
              console.log("Building path map from menuAccessArray:", menuAccessArray);
              menuAccessArray.forEach((item) => {
                const menuId = item.menuid || item.MenuId;
                const menuPath = item.menu?.ActionName || item.ActionName;
                console.log(`Processing item - menuId: ${menuId}, menuPath: ${menuPath}`, item);
                
                if (menuPath && menuId) {
                  // Normalize path (remove leading slash, handle query params)
                  const normalizedPath = menuPath.replace(/^\//, '').split('?')[0];
                  const fullPath = menuPath.split('?')[0];
                  
                  // Map multiple variations for better matching
                  pathMap[normalizedPath] = menuId; // "staff"
                  pathMap[fullPath] = menuId; // "/staff"
                  pathMap[normalizedPath.toLowerCase()] = menuId; // "staff" (lowercase)
                  pathMap[fullPath.toLowerCase()] = menuId; // "/staff" (lowercase)
                  
                  // Also map with trailing slash
                  if (!normalizedPath.endsWith('/')) {
                    pathMap[normalizedPath + '/'] = menuId;
                  }
                  if (!fullPath.endsWith('/')) {
                    pathMap[fullPath + '/'] = menuId;
                  }
                  
                  console.log(`Mapped paths for menuId ${menuId}:`, {
                    normalizedPath,
                    fullPath,
                    normalizedPathLower: normalizedPath.toLowerCase(),
                    fullPathLower: fullPath.toLowerCase()
                  });
                } else {
                  console.log(`Skipping item - missing menuPath or menuId:`, item);
                }
              });
              
              console.log("Path Map Built:", pathMap);
              
              // Update cache
              menuAccessCache = menuAccessArray;
              menuPathMapCache = pathMap;
              cacheTimestamp = Date.now();
            }
          }
        }

        // Determine menuId
        let targetMenuId = menuId;
        
        if (!targetMenuId) {
          // Auto-detect from current route
          const currentPath = location.pathname;
          console.log("Current Path:", currentPath);
          // Try to match full path first
          const pathSegments = currentPath.split('/').filter(Boolean);
          console.log("Path Segments:", pathSegments);
          
          // Try matching from most specific to least specific
          for (let i = pathSegments.length; i > 0; i--) {
            const testPath = '/' + pathSegments.slice(0, i).join('/');
            const testPathNoSlash = pathSegments.slice(0, i).join('/');
            const testPathLower = testPath.toLowerCase();
            const testPathNoSlashLower = testPathNoSlash.toLowerCase();
            
            console.log(`Trying paths: "${testPath}", "${testPathNoSlash}", "${testPathLower}", "${testPathNoSlashLower}"`);
            
            if (pathMap[testPath]) {
              targetMenuId = pathMap[testPath];
              console.log(`Matched with: "${testPath}" -> menuId: ${targetMenuId}`);
              break;
            }
            if (pathMap[testPathNoSlash]) {
              targetMenuId = pathMap[testPathNoSlash];
              console.log(`Matched with: "${testPathNoSlash}" -> menuId: ${targetMenuId}`);
              break;
            }
            if (pathMap[testPathLower]) {
              targetMenuId = pathMap[testPathLower];
              console.log(`Matched with: "${testPathLower}" -> menuId: ${targetMenuId}`);
              break;
            }
            if (pathMap[testPathNoSlashLower]) {
              targetMenuId = pathMap[testPathNoSlashLower];
              console.log(`Matched with: "${testPathNoSlashLower}" -> menuId: ${targetMenuId}`);
              break;
            }
          }
          
          if (!targetMenuId) {
            console.log("No menuId found for path:", currentPath);
          }
        }

        // Find menu access for the determined menuId
        if (targetMenuId && menuAccessArray.length > 0) {
          const menu = menuAccessArray.find(
            (item) => (item.menuid || item.MenuId) === targetMenuId
          );
          
          if (menu) {
            // Debug logging
            console.log("Menu Access Found:", {
              menuId: targetMenuId,
              accessdelete: menu.accessdelete,
              DeleteAccess: menu.DeleteAccess,
              accessedit: menu.accessedit,
              EditAccess: menu.EditAccess,
              accesscreate: menu.accesscreate,
              CreateAccess: menu.CreateAccess,
            });
            
            const canDelete = menu.accessdelete === true || menu.DeleteAccess === true;
            const canEdit = menu.accessedit === true || menu.EditAccess === true;
            const canCreate = menu.accesscreate === true || menu.CreateAccess === true;
            
            console.log("Calculated Access:", { canDelete, canEdit, canCreate });
            
            setMenuAccess({
              canDelete,
              canEdit,
              canCreate,
              isLoading: false,
              menuId: targetMenuId,
            });
            return;
          }
        }

        // No menu found
        setMenuAccess({
          canDelete: false,
          canEdit: false,
          canCreate: false,
          isLoading: false,
          menuId: targetMenuId,
        });
      } catch (error) {
        console.error("Error fetching menu access:", error);
        setMenuAccess({
          canDelete: false,
          canEdit: false,
          canCreate: false,
          isLoading: false,
          menuId: null,
        });
      }
    };
    
    // Initial fetch
    fetchMenuAccess();
    
    // Listen for cache invalidation events
    const handleCacheInvalidation = () => {
      clearMenuAccessCache();
      fetchMenuAccess(true); // Force refresh
    };
    
    window.addEventListener(CACHE_INVALIDATION_EVENT, handleCacheInvalidation);
    
    // Also refresh when window gains focus (user switches back to tab)
    const handleFocus = () => {
      const now = Date.now();
      // If cache is older than 30 seconds, refresh it
      if (!cacheTimestamp || (now - cacheTimestamp) > 30 * 1000) {
        fetchMenuAccess(true);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener(CACHE_INVALIDATION_EVENT, handleCacheInvalidation);
      window.removeEventListener('focus', handleFocus);
    };
  }, [location.pathname, menuId]);

  return menuAccess;
};

// Function to clear cache when needed (e.g., after role change or permission update)
export const clearMenuAccessCache = () => {
  menuAccessCache = null;
  menuPathMapCache = null;
  cacheTimestamp = null;
};

// Function to invalidate cache and notify all hooks to refresh
export const invalidateMenuAccessCache = () => {
  clearMenuAccessCache();
  // Dispatch event to notify all hooks using menu access
  window.dispatchEvent(new CustomEvent(CACHE_INVALIDATION_EVENT));
};

export default useMenuAccess;

