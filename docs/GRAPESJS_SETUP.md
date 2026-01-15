# GrapesJS Setup Instructions

## Installation

Run the following command to install GrapesJS and required plugins:

```bash
npm install grapesjs grapesjs-preset-webpage grapesjs-blocks-basic grapesjs-tailwind
```

Or if using yarn:

```bash
yarn add grapesjs grapesjs-preset-webpage grapesjs-blocks-basic grapesjs-tailwind
```

## Required Packages

- `grapesjs` - Core GrapesJS editor
- `grapesjs-preset-webpage` - Web page preset with essential blocks
- `grapesjs-blocks-basic` - Basic block components
- `grapesjs-tailwind` - Tailwind CSS integration

## Features Implemented

1. **Page Editor** (`components/editor/PageEditor.tsx`)
   - Full GrapesJS editor with Tailwind CSS support
   - Drag and drop blocks
   - Style manager with Tailwind classes
   - Device preview (Desktop, Tablet, Mobile)

2. **Pages Panel** (Collapsible)
   - Lists all generated pages for the storefront
   - Click to switch between pages
   - Visual indicator for current page
   - Can be collapsed/expanded

3. **Page Switching**
   - Automatically saves current page before switching
   - Loads page content into editor
   - Maintains editor state

4. **Save Functionality**
   - Saves HTML and CSS to Firebase
   - Updates only the current page
   - Shows success/error notifications

5. **Route**
   - Editor available at `/editor?subdomain=xxx&page=homepage`
   - Can be accessed after storefront creation

## Usage

After creating a storefront, navigate to:
```
/editor?page=homepage
```

Or from the homepage after storefront creation, click "Edit Storefront" to open the editor.
