import { useRouter } from "next/router";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import {
  House,
  User,
  ClipboardList,
  Folder,
  FileText,
  Settings,
  UsersIcon,
} from "lucide-react";

function handleClick(event) {
  event.preventDefault();
  console.info("You clicked a breadcrumb.");
}

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
    <div role="presentation" onClick={handleClick}>
      <Breadcrumbs aria-label="breadcrumb" separator="›">
        {/* Home Link */}
        <Link
          underline="hover"
          color="inherit"
          href="/"
          className="flex items-center gap-1"
        >
          <House size={20} /> Home
        </Link>

        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const label = formatBreadcrumbLabel(segment);
          const isLast = index === pathSegments.length - 1;
          const icon = getBreadcrumbIcon(segment);

          return isLast ? (
            <Typography
              key={path}
              sx={{ color: "text.primary" }}
              className="flex items-center gap-1"
            >
              {icon} {label}
            </Typography>
          ) : (
            <Link
              key={path}
              underline="hover"
              color="inherit"
              href={path}
              className="flex items-center gap-1"
            >
              {icon} {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </div>
  );
}
