export const rules = [
    {
      name: "Consistent Font & Spacing",
      description: "Use OpenAI-style font (Inter), rounded corners, and consistent spacing.",
      match: "**/*.{tsx,jsx,html}",
      apply: {
        fontFamily: "Inter, sans-serif",
        borderRadius: "rounded-2xl",
        spacing: "p-4 md:p-6 lg:p-8",
      },
    },
    {
      name: "Dark/Light Mode Support",
      description: "Enforce use of Tailwind dark mode classes and themes.",
      match: "**/*.{tsx,jsx}",
      requireClass: ["dark:bg-background", "dark:text-foreground"],
    },
    {
      name: "Chat Interface Style",
      description: "Use bottom-fixed input bar for user prompts, scrollable response area.",
      match: "**/PromptInput.tsx",
      requireElement: [
        { tag: "input", props: { className: "w-full fixed bottom-0 bg-muted" } },
      ],
    },
    {
      name: "Model Switching Panel",
      description: "Ensure a model switcher exists for selecting between AI models (e.g., GPT-4, Gemini).",
      match: "**/Header.tsx",
      requireElement: [
        { tag: "select", props: { id: "model-switcher" } },
      ],
    },
    {
      name: "Sidebar Organization Switcher",
      description: "Verify presence of an org dropdown and search filter in sidebar.",
      match: "**/Sidebar.tsx",
      requireElement: [
        { tag: "select", props: { id: "org-switcher" } },
        { tag: "input", props: { placeholder: "Search policies" } },
      ],
    },
    {
      name: "Prevent Deprecated React Patterns",
      description: "Disallow use of React class components or deprecated lifecycle methods.",
      match: "**/*.{tsx,jsx}",
      disallow: ["ComponentWillMount", "ComponentDidMount", "class extends React.Component"],
    },
    {
      name: "Accessibility Requirements",
      description: "Ensure components meet WCAG accessibility standards.",
      match: "**/*.{tsx,jsx}",
      requireProps: {
        "button": ["aria-label"],
        "img": ["alt"],
        "input": ["aria-label", "aria-describedby"],
        "select": ["aria-label"]
      },
      requireElement: [
        { tag: "button", props: { "aria-label": "*" } },
        { tag: "input", props: { "aria-label": "*" } }
      ]
    },
    {
      name: "Error Boundary Implementation",
      description: "Ensure error boundaries are implemented for main component sections.",
      match: "**/{pages,components}/**/*.tsx",
      requireImport: ["ErrorBoundary"],
      requireElement: [
        { tag: "ErrorBoundary" }
      ]
    },
    {
      name: "Performance Optimization",
      description: "Enforce React performance best practices.",
      match: "**/*.{tsx,jsx}",
      requireHooks: ["useMemo", "useCallback"],
      disallow: [
        "Object.keys(*).map",
        "Object.values(*).map",
        "Object.entries(*).map"
      ]
    },
    {
      name: "Consistent Icon Usage",
      description: "Enforce consistent Lucide icon imports and usage.",
      match: "**/*.{tsx,jsx}",
      requireImport: [{ from: "lucide-react", name: "*" }],
      disallow: [
        "import { LightBulb } from 'lucide-react'"
      ],
      requireElement: [
        { tag: "Icons", props: { name: "lightbulb" } }
      ]
    },
    {
      name: "Enhanced Dark Mode Support",
      description: "Comprehensive dark mode implementation with semantic color tokens.",
      match: "**/*.{tsx,jsx}",
      requireClass: [
        "dark:bg-background",
        "dark:text-foreground",
        "dark:hover:bg-muted",
        "dark:focus:ring-primary"
      ],
      disallow: [
        "bg-white",
        "bg-black",
        "text-white",
        "text-black"
      ]
    },
    {
      name: "Form Validation Rules",
      description: "Enforce consistent form validation patterns.",
      match: "**/*Form.{tsx,jsx}",
      requireImport: ["useForm", "zodResolver"],
      requireElement: [
        { tag: "form", props: { "onSubmit": "handleSubmit(*)", "noValidate": true } },
        { tag: "ErrorMessage" }
      ]
    },
    {
      name: "Authentication Provider Setup",
      description: "Ensure proper authentication provider implementation.",
      match: "**/providers/auth-provider.tsx",
      requireImport: [
        { from: "next-auth/react", name: "SessionProvider" },
        { from: "next-auth", name: "Session" }
      ],
      requireElement: [
        { tag: "SessionProvider", props: { session: "*" } }
      ]
    },
    {
      name: "Protected Route Guards",
      description: "Enforce authentication checks on protected routes.",
      match: "**/pages/**/*.tsx",
      requireImport: [
        { from: "next-auth/react", name: "useSession" },
        { from: "@/lib/auth", name: "withAuth" }
      ],
      requireElement: [
        { tag: "AuthGuard" }
      ]
    },
    {
      name: "Authentication State Management",
      description: "Ensure consistent authentication state handling.",
      match: "**/{hooks,utils}/auth/*.{ts,tsx}",
      requireImport: [
        { from: "next-auth/react", name: "signIn" },
        { from: "next-auth/react", name: "signOut" },
        { from: "next-auth/react", name: "useSession" }
      ],
      disallow: [
        "localStorage.setItem('token'",
        "sessionStorage.setItem('token'",
        "document.cookie"
      ]
    },
    {
      name: "Secure API Routes",
      description: "Enforce authentication middleware on API routes.",
      match: "**/pages/api/**/*.ts",
      requireImport: [
        { from: "next-auth/next", name: "getServerSession" },
        { from: "@/lib/auth", name: "authOptions" }
      ],
      requireElement: [
        { tag: "getServerSession", props: { "authOptions": "*" } }
      ]
    }
  ];