import HomeIcon from "@mui/icons-material/Home";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import BusinessIcon from "@mui/icons-material/Business";
import PublicIcon from "@mui/icons-material/Public";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import GroupIcon from "@mui/icons-material/Group";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import WarehouseIcon from "@mui/icons-material/Warehouse";

export const MasterMenuItemList = [
    {
      text: "Addresses",
      tableKey: "addresses",
      icon: <HomeIcon />,
      path: "/master/addresses",
    },
    {
      text: "Address Type",
      tableKey: "address-types",
      icon: <HomeIcon />,
      path: "/master/address-types",
    },
    {
      text: "Certifications",
      tableKey: "certifications",
      icon: <VerifiedIcon />,
      path: "/master/certifications",
    },
    {
      text: "Cities",
      tableKey: "city",
      icon: <LocationCityIcon />,
      path: "/master/cities",
    },
    {
      text: "Companies",
      tableKey: "companies",
      icon: <BusinessIcon />,
      path: "/master/companies",
    },
    {
      text: "Countries",
      tableKey: "country-of-origin",
      icon: <PublicIcon />,
      path: "/master/countries",
    },
    {
      text: "Currencies",
      tableKey: "currencies",
      icon: <AttachMoneyIcon />,
      path: "/master/currencies",
    },
    {
      text: "Customers",
      tableKey: "customers",
      icon: <PeopleIcon />,
      path: "/master/customers",
    },
    {
      text: "Forms",
      tableKey: "forms",
      icon: <DescriptionIcon />,
      path: "/master/forms",
    },
    {
      text: "Form Roles",
      tableKey: "formrole",
      icon: <AssignmentIndIcon />,
      path: "/master/form-roles",
    },
    {
      text: "Form Role Approvers",
      tableKey: "formroleapprover",
      icon: <AdminPanelSettingsIcon />,
      path: "/master/form-role-approvers",
    },
    {
      text: "Items",
      tableKey: "items",
      icon: <CategoryIcon />,
      path: "/master/items",
    },
    {
      text: "Roles",
      tableKey: "roles",
      icon: <PersonIcon />,
      path: "/master/roles",
    },
    {
      text: "Subscriptions",
      tableKey: "subscriptionplan",
      icon: <SubscriptionsIcon />,
      path: "/master/subscriptions",
    },
    {
      text: "Suppliers",
      tableKey: "suppliers",
      icon: <GroupIcon />,
      path: "/master/suppliers",
    },
    {
      text: "Units of Measurement",
      tableKey: "uoms",
      icon: <CategoryIcon />,
      path: "/master/uoms",
    },
    {
      text: "Vehicles",
      tableKey: "vehicles",
      icon: <DirectionsBusIcon />,
      path: "/master/vehicles",
    },
    {
      text: "Warehouses",
      tableKey: "warehouses",
      icon: <WarehouseIcon />,
      path: "/master/warehouses",
    },
  ];