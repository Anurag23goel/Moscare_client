import { useRouter } from "next/router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import {
  House,
  User,
  ClipboardList,
  Folder,
  FileText,
  Settings,
  UsersIcon,
} from "lucide-react";

export function CustomBreadcrumbs() {
  const router = useRouter();
  const pathSegments = router.pathname.split("/").filter(Boolean);

  // Function to format segment names into readable labels
  const formatBreadcrumbLabel = (segment) => {
    return segment
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/-/g, " ") // Replace hyphens with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };

  // Function to assign icons based on segment names
  const getBreadcrumbIcon = (segment) => {
    const icons = {
      client: <User size={18} />,
      profile: <ClipboardList size={18} />,
      timesheets: <Folder size={18} />,
      agreement: <FileText size={18} />,
      maintenance: <Settings size={18} />,
      categories: <Folder size={18} />,
      operations: <ClipboardList size={18} />,
      RosterManagement: <UsersIcon size={18} />,
    };
    return icons[segment] || <FileText size={18} />; // Fallback icon
  };

  return (
    <Breadcrumb className="border border-black px-10">
      <BreadcrumbList>
        {/* Home Link (Always Clickable) */}
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/"
            className="text-black flex items-center gap-1 no-underline"
          >
            <House size={20} /> Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const label = formatBreadcrumbLabel(segment);
          const isLast = index === pathSegments.length - 1;
          const icon = getBreadcrumbIcon(segment);

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex flex-row items-center gap-1">
                    {icon} {label}
                  </BreadcrumbPage>
                ) : (
                  <span className="text-black flex items-center gap-1">
                    {icon} {label}
                  </span> // Non-clickable text with icon
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
