/**
 * GrapesJS Configuration for Dynamic Content Locking
 * 
 * Configures GrapesJS to display dynamic content as non-editable preview sections.
 * Users can see how dynamic sections look but cannot modify them.
 */

/**
 * Initialize GrapesJS with dynamic content locking
 */
export function initGrapesJSWithLocking(editor: any) {
  // Register custom component type for dynamic content
  editor.DomComponents.addType('dynamic-content', {
    model: {
      defaults: {
        name: 'Dynamic Content',
        editable: false,
        draggable: false,
        droppable: false,
        copyable: false,
        removable: false,
        selectable: true, // Allow selection to show info
        hoverable: true,
        stylable: false,
        highlightable: false,
        layerable: true,
        tagName: 'div',
        traits: [],
        toolbar: [], // Remove all toolbar options
      }
    },
    view: {
      events: {
        dblclick: 'handleDblClick',
      },
      handleDblClick(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        // Show notification that this is dynamic content
        editor.Notifications?.add?.({
          type: 'info',
          content: 'This section displays dynamic data and cannot be edited.',
          timeout: 3000,
        });
      },
    }
  });

  // Auto-detect and mark dynamic content elements
  editor.on('component:add', (component: any) => {
    const el = component.getEl?.();
    if (el && (
      el.hasAttribute('data-dynamic-content') ||
      el.classList?.contains('dynamic-content') ||
      el.hasAttribute('data-gjs-type') && el.getAttribute('data-gjs-type') === 'dynamic-content'
    )) {
      component.set({
        type: 'dynamic-content',
        editable: false,
        draggable: false,
        droppable: false,
        copyable: false,
        removable: false,
        stylable: false,
      });
    }
  });

  // Block editing of dynamic elements on selection
  editor.on('component:selected', (component: any) => {
    const el = component.getEl?.();
    if (el && el.hasAttribute('data-dynamic-content')) {
      // Deselect nested editable elements
      component.get('components')?.forEach((child: any) => {
        child.set('editable', false);
      });
    }
  });

  // Add custom CSS for dynamic content styling in editor
  const styleManager = editor.StyleManager;
  if (styleManager) {
    editor.addStyle(`
      [data-dynamic-content] {
        position: relative;
      }
      [data-dynamic-content]::before {
        content: '🔒 Dynamic';
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(59, 130, 246, 0.9);
        color: white;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 4px;
        z-index: 100;
        pointer-events: none;
      }
      [data-dynamic-content]:hover {
        outline: 2px dashed rgba(59, 130, 246, 0.5);
        outline-offset: -2px;
      }
    `);
  }

  // Register a custom block for product filter (locked)
  editor.BlockManager.add('product-filter', {
    label: 'Product Filter',
    category: 'Dynamic',
    content: {
      type: 'dynamic-content',
      content: `
        <div data-dynamic-content="true" class="product-filter-preview bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 text-center">
          <p class="text-gray-500 font-medium">🔍 Product Filter Section</p>
          <p class="text-gray-400 text-sm">Search, category, and sort filters will appear here</p>
        </div>
      `,
    },
    attributes: { class: 'fa fa-filter' }
  });

  // Register a custom block for products grid (locked)
  editor.BlockManager.add('products-grid', {
    label: 'Products Grid',
    category: 'Dynamic',
    content: {
      type: 'dynamic-content',
      content: `
        <div data-dynamic-content="true" class="products-preview p-4 rounded-xl border-2 border-dashed border-gray-200 text-center">
          <p class="text-gray-500 font-medium">📦 Products Grid</p>
          <p class="text-gray-400 text-sm">Your products will be displayed here dynamically</p>
        </div>
      `,
    },
    attributes: { class: 'fa fa-th' }
  });

  console.log('✅ GrapesJS dynamic content locking initialized');
}

/**
 * Generate GrapesJS initialization script for injection into pages
 */
export function generateGrapesJSLockingScript(): string {
  return `
<script>
(function() {
  // Wait for GrapesJS editor to be available
  const waitForEditor = setInterval(function() {
    if (window.grapesjs && window.editor) {
      clearInterval(waitForEditor);
      initDynamicContentLocking(window.editor);
    }
  }, 100);

  function initDynamicContentLocking(editor) {
    // Mark all elements with data-dynamic-content as non-editable
    editor.on('load', function() {
      editor.getWrapper().find('[data-dynamic-content]').forEach(function(component) {
        component.set({
          editable: false,
          draggable: false,
          droppable: false,
          copyable: false,
          removable: false,
          selectable: true,
          stylable: false,
        });
      });
    });

    // Prevent editing on double-click
    editor.on('component:selected', function(component) {
      const el = component.getEl();
      if (el && el.closest('[data-dynamic-content]')) {
        component.set('editable', false);
      }
    });

    console.log('Dynamic content locking enabled');
  }
})();
</script>
`;
}
