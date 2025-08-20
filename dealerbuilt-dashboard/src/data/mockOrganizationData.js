// Mock organization data representing a multi-location dealership group
export const mockOrganizationData = [
  {
    id: 'org_1',
    name: 'Premier Auto Group',
    logo: '/api/placeholder/120/40',
    type: 'dealership_group',
    settings: {
      timezone: 'America/Chicago',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light',
      language: 'en-US',
    },
    locations: [
      {
        id: '1',
        name: 'Premier Ford Lincoln',
        address: '123 Main St, Des Moines, IA 50309',
        phone: '(515) 555-0101',
        timezone: 'America/Chicago',
        type: 'ford_lincoln',
        departments: ['sales', 'service', 'parts', 'finance', 'administration'],
        manager: 'Tim Behm',
        coordinates: { lat: 41.5868, lng: -93.6250 },
      },
      {
        id: '2',
        name: 'Premier Chevrolet Buick',
        address: '456 Oak Ave, Ames, IA 50010',
        phone: '(515) 555-0102',
        timezone: 'America/Chicago',
        type: 'chevrolet_buick',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Shawn Allen',
        coordinates: { lat: 42.0308, lng: -93.6319 },
      },
      {
        id: '3',
        name: 'Premier Honda',
        address: '789 Elm St, Cedar Rapids, IA 52402',
        phone: '(319) 555-0103',
        timezone: 'America/Chicago',
        type: 'honda',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Christopher Arndt-Sublett',
        coordinates: { lat: 41.9778, lng: -91.6656 },
      },
      {
        id: '8',
        name: 'Premier Toyota',
        address: '321 Pine St, Iowa City, IA 52240',
        phone: '(319) 555-0108',
        timezone: 'America/Chicago',
        type: 'toyota',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Jared Adams',
        coordinates: { lat: 41.6611, lng: -91.5302 },
      },
      {
        id: '13',
        name: 'Premier Nissan',
        address: '654 Maple Dr, Waterloo, IA 50701',
        phone: '(319) 555-0113',
        timezone: 'America/Chicago',
        type: 'nissan',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Zach Abbas',
        coordinates: { lat: 42.4928, lng: -92.3426 },
      },
      {
        id: '15',
        name: 'Premier Hyundai',
        address: '987 Cedar Ln, Dubuque, IA 52001',
        phone: '(563) 555-0115',
        timezone: 'America/Chicago',
        type: 'hyundai',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Lauren Arnold',
        coordinates: { lat: 42.5006, lng: -90.6648 },
      },
      {
        id: '17',
        name: 'Premier Volkswagen',
        address: '147 Birch St, Sioux City, IA 51101',
        phone: '(712) 555-0117',
        timezone: 'America/Chicago',
        type: 'volkswagen',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Pete Cash',
        coordinates: { lat: 42.4959, lng: -96.4003 },
      },
      {
        id: '20',
        name: 'Premier Subaru',
        address: '258 Walnut Ave, Council Bluffs, IA 51501',
        phone: '(712) 555-0120',
        timezone: 'America/Chicago',
        type: 'subaru',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Jessica Bennett',
        coordinates: { lat: 41.2619, lng: -95.8608 },
      },
      {
        id: '21',
        name: 'Premier Mazda',
        address: '369 Hickory Rd, Mason City, IA 50401',
        phone: '(641) 555-0121',
        timezone: 'America/Chicago',
        type: 'mazda',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Tim Behm',
        coordinates: { lat: 43.1536, lng: -93.2010 },
      },
      {
        id: '24',
        name: 'Premier Kia',
        address: '741 Ash St, Burlington, IA 52601',
        phone: '(319) 555-0124',
        timezone: 'America/Chicago',
        type: 'kia',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Tim Behm',
        coordinates: { lat: 40.8076, lng: -91.1129 },
      },
      {
        id: '27',
        name: 'Premier Jeep Ram',
        address: '852 Spruce Ave, Ottumwa, IA 52501',
        phone: '(641) 555-0127',
        timezone: 'America/Chicago',
        type: 'jeep_ram',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Pete Cash',
        coordinates: { lat: 41.0197, lng: -92.4088 },
      },
      {
        id: '28',
        name: 'Premier Chrysler Dodge',
        address: '963 Poplar St, Fort Dodge, IA 50501',
        phone: '(515) 555-0128',
        timezone: 'America/Chicago',
        type: 'chrysler_dodge',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Adam Beller',
        coordinates: { lat: 42.4974, lng: -94.1680 },
      },
    ],
  },
  {
    id: 'org_2',
    name: 'Midwest Motors',
    logo: '/api/placeholder/120/40',
    type: 'dealership_group',
    settings: {
      timezone: 'America/Chicago',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'dark',
      language: 'en-US',
    },
    locations: [
      {
        id: '101',
        name: 'Midwest BMW',
        address: '100 Auto Plaza, Omaha, NE 68102',
        phone: '(402) 555-0101',
        timezone: 'America/Chicago',
        type: 'bmw',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Sarah Johnson',
        coordinates: { lat: 41.2565, lng: -95.9345 },
      },
      {
        id: '102',
        name: 'Midwest Mercedes-Benz',
        address: '200 Luxury Lane, Lincoln, NE 68508',
        phone: '(402) 555-0102',
        timezone: 'America/Chicago',
        type: 'mercedes_benz',
        departments: ['sales', 'service', 'parts', 'finance'],
        manager: 'Michael Davis',
        coordinates: { lat: 40.8136, lng: -96.7026 },
      },
    ],
  },
  {
    id: 'org_3',
    name: 'Heartland Auto',
    logo: '/api/placeholder/120/40',
    type: 'single_location',
    settings: {
      timezone: 'America/Chicago',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'auto',
      language: 'en-US',
    },
    locations: [
      {
        id: '201',
        name: 'Heartland Auto Center',
        address: '500 Highway 35, Kansas City, MO 64111',
        phone: '(816) 555-0201',
        timezone: 'America/Chicago',
        type: 'multi_brand',
        departments: ['sales', 'service', 'parts', 'finance', 'administration'],
        manager: 'Robert Wilson',
        coordinates: { lat: 39.0997, lng: -94.5786 },
      },
    ],
  },
];

// Helper function to get location by ID across all organizations
export const getLocationById = (locationId) => {
  for (const org of mockOrganizationData) {
    const location = org.locations.find(loc => loc.id === locationId);
    if (location) {
      return { ...location, organizationId: org.id, organizationName: org.name };
    }
  }
  return null;
};

// Helper function to get all locations for a user
export const getUserLocations = (allowedLocations) => {
  if (allowedLocations.includes('*')) {
    // Return all locations
    return mockOrganizationData.flatMap(org => 
      org.locations.map(loc => ({ ...loc, organizationId: org.id, organizationName: org.name }))
    );
  }

  const locations = [];
  for (const locationId of allowedLocations) {
    const location = getLocationById(locationId);
    if (location) {
      locations.push(location);
    }
  }
  return locations;
};

