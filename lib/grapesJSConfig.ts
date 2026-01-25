/**
 * GrapesJS Configuration for Dynamic Content Locking
 * 
 * Configures GrapesJS to display dynamic content as non-editable preview sections.
 * Users can see how dynamic sections look but cannot modify them.
 * However, they CAN delete and replace them with new designs from a config page.
 */

import { getAllDummyTemplates } from './dummyDataTemplates';

/**
 * Initialize GrapesJS with dynamic content locking
 */
export function initGrapesJSWithLocking(editor: any, companyName: string = "Your Store") {
  // Register custom component type for dynamic content
  editor.DomComponents.addType('dynamic-content', {
    model: {
      defaults: {
        name: 'Dynamic Content',
        editable: false, // Cannot edit content
        draggable: false, // Cannot drag
        droppable: false, // Cannot drop into
        copyable: false, // Cannot copy
        removable: true, // CAN DELETE - this is important!
        selectable: true, // Allow selection to show info
        hoverable: true,
        stylable: false, // Cannot style
        highlightable: false,
        layerable: true,
        tagName: 'div',
        traits: [],
        toolbar: [
          {
            name: 'delete',
            command: 'tlb-delete',
            label: 'Delete',
            attributes: { title: 'Delete this dynamic block' }
          },
          {
            name: 'change-design',
            command: 'tlb-change-design',
            label: 'Change Design',
            attributes: { title: 'Change design from config page' }
          }
        ],
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
          content: 'This section displays dynamic data. Edit it from the Dynamic Components config page.',
          timeout: 4000,
        });
      },
    }
  });

  // Register command to open config page
  editor.Commands.add('tlb-change-design', {
    run(editor: any, sender: any) {
      const component = editor.getSelected();
      if (component) {
        const blockType = component.getAttributes()['data-block-type'];
        if (blockType) {
          // Open config page in new tab or trigger modal
          window.open(`/dashboard/${editor.getConfig().subdomain || 'storefront'}/components?type=${blockType}`, '_blank');
          editor.Notifications?.add?.({
            type: 'info',
            content: `Opening ${blockType} design config page...`,
            timeout: 3000,
          });
        }
      }
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
        removable: true, // Allow deletion
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
      
      // Show info about the dynamic block
      const blockType = el.getAttribute('data-block-type') || 'dynamic';
      editor.Notifications?.add?.({
        type: 'info',
        content: `${blockType} block selected. This is dynamic content. Delete to remove or use "Change Design" to modify from config page.`,
        timeout: 4000,
      });
    }
  });

  // Add custom CSS for dynamic content styling in editor
  const styleManager = editor.StyleManager;
  if (styleManager) {
    editor.addStyle(`
      [data-dynamic-content] {
        position: relative;
        min-height: 50px;
      }
      [data-dynamic-content]::before {
        content: '🔒 Dynamic (Deletable)';
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(59, 130, 246, 0.9);
        color: white;
        font-size: 10px;
        padding: 4px 8px;
        border-radius: 4px;
        z-index: 1000;
        pointer-events: none;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      [data-dynamic-content]:hover {
        outline: 2px dashed rgba(59, 130, 246, 0.5);
        outline-offset: -2px;
      }
      [data-dynamic-content]::after {
        content: 'Double-click to learn more';
        position: absolute;
        bottom: 4px;
        left: 4px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 3px;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }
      [data-dynamic-content]:hover::after {
        opacity: 1;
      }
    `);
  }

  // Register all dummy template blocks
  const templates = getAllDummyTemplates(companyName);
  
  templates.forEach(template => {
    editor.BlockManager.add(template.id, {
      label: template.name,
      category: template.category,
      content: template.html,
      attributes: { 
        class: 'gjs-block-dynamic',
        'data-template-id': template.id
      },
      activate: true,
    });
  });

  // Register a custom block for product filter (locked)
  editor.BlockManager.add('product-filter', {
    label: 'Product Filter',
    category: 'Dynamic',
    content: {
      type: 'dynamic-content',
      content: `
        <div 
          data-dynamic-content="product-filter" 
          data-gjs-editable="false" 
          data-gjs-droppable="false" 
          data-gjs-selectable="true" 
          data-gjs-removable="true" 
          data-gjs-hoverable="true"
          data-block-id="product-filter-001"
          data-block-type="product-filter"
          class="product-filter-preview bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 text-center"
        >
          <p class="text-gray-500 font-medium">🔍 Product Filter Section</p>
          <p class="text-gray-400 text-sm">Search, category, and sort filters will appear here</p>
        </div>
      `,
    },
    attributes: { class: 'fa fa-filter' }
  });

  console.log('✅ GrapesJS dynamic content locking initialized');
  console.log(`✅ Registered ${templates.length} dummy templates`);
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
