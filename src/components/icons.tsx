import React from 'react';

export const VisaLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="1000" height="323" viewBox="0 0 1000 323">
    <path fill="#1A1F71" d="M699,73.5H592.3L531.1,250h85.2L699,73.5z M904.4,121.1L814,250h87.4L990,73.5h-88L904.4,121.1z M890,73.5l-31.5,176.5h85.7L975.7,73.5H890z M490.5,73.5H400L259.3,250h87L490.5,73.5z M230.5,73.5h-99.3l-59,176.5h86.6L230.5,73.5z M10,73.5H0l141,176.5h87.6L10,73.5z"/>
  </svg>
);

export const AmexLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="20" rx="3" fill="#0077C8"/>
        <path d="M12 6H14L16 10L18 6H20L17 10.5L20 15H18L16 11L14 15H12L15 10.5L12 6Z" fill="white"/>
        <rect x="5" y="6" width="2" height="9" fill="white"/>
        <rect x="25" y="6" width="2" height="9" fill="white"/>
    </svg>
);

export const MastercardLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7" fill="#EA001B"/>
        <circle cx="22" cy="10" r="7" fill="#F79E1B"/>
        <path d="M16 10C16 13.866 13.866 17 11 17C8.13401 17 6 13.866 6 10C6 6.13401 8.13401 3 11 3C13.866 3 16 6.13401 16 10Z" fill="#FF5F00"/>
    </svg>
);

export const RupayLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 35" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.4 30.7L9.9 22.8H2.1V30.7H0V4.2H10.1C13.8 4.2 16.7 5.1 18.7 6.8C20.7 8.5 21.7 10.8 21.7 13.5C21.7 15.6 21.1 17.4 20 18.8C18.9 20.3 17.3 21.3 15.3 21.7L22.1 30.7H15.4ZM15.8 13.6C15.8 12.1 15.4 10.9 14.6 9.9C13.8 8.9 12.5 8.4 10.7 8.4H7.9V18.7H10.5C12.4 18.7 13.8 18.2 14.7 17.2C15.5 16.2 15.8 15 15.8 13.6Z" fill="#E45A25"/>
        <path d="M37.8 4.2H25.3V10H30.7V30.7H32.8V10H37.8V4.2Z" fill="#0071BC"/>
        <path d="M49.3 19.3L45.8 30.7H43.6L46.8 20.4L40.2 4.2H42.7L47.5 17.2L52.4 4.2H54.8L49.3 19.3Z" fill="#E45A25"/>
        <path d="M59 13.3C59 10.2 59.8 7.7 61.4 5.9C63 4.9 64.9 4.2 67.2 4.2C69.6 4.2 71.6 4.9 73.2 5.9C74.7 7.7 75.5 10.2 75.5 13.3C75.5 16.5 74.7 19.1 73.2 20.8C71.6 22.5 69.6 23.3 67.2 23.3C64.9 23.3 63 22.5 61.4 20.8C59.8 19.1 59 16.5 59 13.3ZM67.2 20.3C68.6 20.3 69.6 19.6 70.3 18.3C71 17.1 71.3 15.4 71.3 13.3C71.3 11.2 71 9.6 70.3 8.3C69.6 7.1 68.6 6.3 67.2 6.3C65.9 6.3 64.9 7.1 64.2 8.3C63.5 9.6 63.2 11.2 63.2 13.3C63.2 15.4 63.5 17.1 64.2 18.3C64.9 19.6 65.9 20.3 67.2 20.3Z" fill="#0071BC"/>
        <path d="M78.6 4.2H87.1L90.7 15.4L94.3 4.2H100V30.7H97.9V10.1L94.4 22.4H90.9L87.5 10.1V30.7H85.4V4.2H78.6Z" fill="#E45A25"/>
    </svg>
);


export const GenericCardLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card">
        <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
);
