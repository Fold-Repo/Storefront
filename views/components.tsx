 "use client"

import React, { useState } from "react"
import { useDisclosure } from "@heroui/react"
import { Button, Drawer, MenuDropdown, PopupModal, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input, Select, TextArea, CheckBox } from "@/components/ui"
import { Pagination, SearchInput, TableComponent } from "@/components/reusable"

type ComponentDoc = {
  name: string
  importPath: string
  usage: string
  notes?: string
}

const sections: { title: string; items: ComponentDoc[] }[] = [
  {
    title: "UI",
    items: [
      {
        name: "Button",
        importPath: `import { Button } from "@/components/ui";`,
        usage: `<Button color="primary" onPress={onClick}>Save</Button>`,
        notes: "Wraps HeroUI Button; supports color/variant/loading/startContent/endContent.",
      },
      {
        name: "Drawer",
        importPath: `import { Drawer, useDisclosure } from "@/components/ui";`,
        usage: `const {isOpen,onOpenChange,onOpen} = useDisclosure();\n<Drawer isOpen={isOpen} onOpenChange={onOpenChange} title="Filters">...</Drawer>`,
        notes: "Placements: top/bottom/left/right; set footer/title/icon and close button visibility.",
      },
      {
        name: "MenuDropdown",
        importPath: `import { MenuDropdown } from "@/components/ui";`,
        usage: `<MenuDropdown items={[{key:"asc",label:"Ascending"}]} onChange={(k)=>setSort(k)} />`,
        notes: "Accepts custom trigger or uses provided button with chevron; controlled via value/onChange.",
      },
      {
        name: "PopupModal",
        importPath: `import { PopupModal } from "@/components/ui";`,
        usage: `<PopupModal isOpen={open} onClose={close} title="Confirm" footer={<Actions/>}>Body</PopupModal>`,
        notes: "Supports size, placement, custom header/body/footer classes, optional close button.",
      },
      {
        name: "Table primitives",
        importPath: `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";`,
        usage: `<Table><TableHeader><TableRow><TableHead>Col</TableHead></TableRow></TableHeader><TableBody>...</TableBody></Table>`,
        notes: "Prefer the reusable TableComponent for real data tables; primitives stay for custom layouts.",
      },
    ],
  },
  {
    title: "Form",
    items: [
      {
        name: "Input / PasswordInput / PhoneInput",
        importPath: `import { Input, PasswordInput, PhoneInput } from "@/components/ui";`,
        usage: `<Input label="Email" name="email" value={email} onChange={...} />`,
        notes: "Share Label/Error helpers; PhoneInput adds country code UI.",
      },
      {
        name: "CheckBox / Radio",
        importPath: `import { CheckBox, Radio } from "@/components/ui";`,
        usage: `<CheckBox checked={checked} onChange={setChecked}>Remember me</CheckBox>`,
      },
      {
        name: "Select",
        importPath: `import { Select } from "@/components/ui";`,
        usage: `<Select label="Role" options={[{label:"Admin", value:"admin"}]} onChange={...} />`,
      },
      {
        name: "TextArea",
        importPath: `import { TextArea } from "@/components/ui";`,
        usage: `<TextArea label="Notes" value={notes} onChange={...} />`,
      },
      {
        name: "Label helpers",
        importPath: `import { createInputLabel, createFileLabel } from "@/components/ui";`,
        usage: `const label = createInputLabel("Email","email");`,
      },
      {
        name: "ErrorMessage",
        importPath: `import { ErrorMessage } from "@/components/ui";`,
        usage: `<ErrorMessage message={errors.email} />`,
      },
    ],
  },
  {
    title: "Reusable",
    items: [
      {
        name: "SearchInput",
        importPath: `import { SearchInput } from "@/components/reusable";`,
        usage: `<SearchInput onSearch={(value)=>setQuery(value)} debounceDelay={400} />`,
        notes: "Debounces input before calling onSearch; customizable classes and icon.",
      },
      {
        name: "Pagination",
        importPath: `import { Pagination } from "@/components/reusable";`,
        usage: `<Pagination currentPage={page} totalItems={total} itemsPerPage={20} onPageChange={setPage} />`,
        notes: "Displays range text; customizable button labels and helper text.",
      },
      {
        name: "TableComponent",
        importPath: `import { TableComponent } from "@/components/reusable";`,
        usage: `<TableComponent columns={[{key:"name",title:"Name"}]} data={rows} rowKey={(r)=>r.id} renderRow={(row)=> (<><TableCell>{row.name}</TableCell></>)} withCheckbox onSelectionChange={setSelected} />`,
        notes: "Composes table primitives with optional checkbox selection, skeleton/loading, and empty state.",
      },
    ],
  },
]

export const ComponentsView = () => {
  const { isOpen, onOpenChange, onOpen } = useDisclosure()
  const [isModalOpen, setModalOpen] = useState(false)

  const tableColumns = [
    { key: "name", title: "Name" },
    { key: "role", title: "Role" },
  ]

  const tableData = [
    { id: "1", name: "Alice", role: "Admin" },
    { id: "2", name: "Bob", role: "Editor" },
  ]

  const sampleMenuItems = [
    { key: "profile", label: "Profile" },
    { key: "settings", label: "Settings" },
  ]

  return (
    <div className="container py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Components</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Component Library</h1>
        <p className="text-neutral-600 text-sm max-w-2xl">
          Import from <code className="px-1 py-0.5 rounded bg-neutral-100 text-neutral-800">@/components</code>.
          UI wraps HeroUI primitives; Reusable adds opinionated patterns; Form exports inputs and helpers.
        </p>
      </header>

      <div className="grid gap-6">
        {sections.map((section) => (
          <section key={section.title} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">{section.title}</h2>
            <div className="divide-y divide-neutral-200">
              {section.items.map((item) => (
                <div key={item.name} className="py-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-neutral-900">{item.name}</p>
                      <p className="text-xs font-mono text-neutral-600">{item.importPath}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <p className="text-[13px] text-neutral-600 mb-2">Live sample</p>
                    {item.name === "Button" && (
                      <div className="flex gap-2 flex-wrap">
                        <Button color="primary">Primary</Button>
                        <Button variant="bordered">Bordered</Button>
                        <Button color="success" onPress={() => onOpen()}>Open Drawer</Button>
                        <Button color="warning" onPress={() => setModalOpen(true)}>Open Modal</Button>
                      </div>
                    )}
                    {item.name === "Drawer" && (
                      <div className="flex gap-2">
                        <Button size="sm" onPress={onOpen}>Toggle drawer</Button>
                      </div>
                    )}
                    {item.name === "MenuDropdown" && (
                      <MenuDropdown items={sampleMenuItems} onChange={() => {}} />
                    )}
                    {item.name === "PopupModal" && (
                      <Button size="sm" onPress={() => setModalOpen(true)}>Show modal</Button>
                    )}
                    {item.name === "Table primitives" && (
                      <div className="space-y-2">
                        <p className="text-[13px] text-neutral-600">Use the reusable TableComponent for data tables:</p>
                        <TableComponent
                          columns={tableColumns}
                          data={tableData}
                          rowKey={(row) => row.id}
                          renderRow={(row) => (
                            <>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.role}</TableCell>
                            </>
                          )}
                        />
                      </div>
                    )}
                    {item.name === "Input / PasswordInput / PhoneInput" && (
                      <div className="grid gap-3">
                        <Input name="email" label="Email" placeholder="you@example.com" />
                        <Select name="exam" label="Exam">
                          <option value="jamb">JAMB</option>
                          <option value="waec">WAEC</option>
                        </Select>
                        <TextArea name="notes" label="Notes" placeholder="Add any extra details" />
                      </div>
                    )}
                    {item.name === "CheckBox / Radio" && (
                      <div className="flex gap-4">
                        <CheckBox name="remember" defaultChecked label="Remember me" />
                        <CheckBox name="subscribe" label="Subscribe" />
                      </div>
                    )}
                    {item.name === "SearchInput" && (
                      <SearchInput className="max-w-xs" onSearch={() => {}} />
                    )}
                    {item.name === "Pagination" && (
                      <Pagination currentPage={1} totalItems={50} itemsPerPage={10} onPageChange={() => {}} />
                    )}
                    {item.name === "TableComponent" && (
                      <TableComponent
                        columns={tableColumns}
                        data={tableData}
                        rowKey={(row) => row.id}
                        renderRow={(row) => (
                          <>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.role}</TableCell>
                          </>
                        )}
                        withCheckbox
                        onSelectionChange={() => {}}
                      />
                    )}
                  </div>
                  <pre className="text-sm bg-neutral-50 border border-neutral-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{item.usage}</pre>
                  {item.notes && <p className="text-sm text-neutral-600">{item.notes}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Sample drawer"
      >
        <p className="text-sm text-neutral-700">Put any side content here.</p>
      </Drawer>

      <PopupModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample modal"
        description="A quick look at PopupModal."
        footer={
          <div className="flex gap-2">
            <Button variant="light" onPress={() => setModalOpen(false)}>Close</Button>
            <Button color="primary" onPress={() => setModalOpen(false)}>Confirm</Button>
          </div>
        }
      >
        <div className="text-sm text-neutral-700">
          Use PopupModal for dialogs with custom header, body, and footer.
        </div>
      </PopupModal>
    </div>
  )
}

