export type EwasteCategoryItemData = {
    id: string;
    categoryName: string; // The actual category name for forms (e.g., "Laptop battery")
    avatar: string; // URL for the category icon/image
    hasStory: boolean; // Indicates if there's detailed info for the category
    title: string; // Short display title (e.g., "Laptops & Tablets")
    information: string; // Detailed information about the category
    routeSlug: string; // The slug for routing to the specific form component (e.g., 'Laptop' -> /forms/Laptop)
};

export const EWASTE_CATEGORIES: EwasteCategoryItemData[] = [
    {
        id: "1",
        categoryName: "Laptop battery",
        avatar: "https://cdn-icons-png.flaticon.com/512/3582/3582038.png",
        hasStory:true,
        title: "Laptops & Tablets",
        information: "Laptops and tablets 💻📱 have become essential tools in our daily lives, but once they’re outdated or broken, they shouldn’t end up in the trash 🚫. These devices contain batteries, circuit boards, and other components that can release harmful chemicals into the environment if not handled properly 🌍⚠️. Dumping them pollutes the soil, water, and air 💧🌫️. Instead, take a responsible step by handing them over to certified e-waste recycling centers ♻️. These facilities safely recycle or repurpose valuable materials 🔄. Protect nature and reduce tech waste — recycle your old gadgets and keep the planet green 🌱💚🌎.",
        routeSlug: 'Laptop',
    },
    {
        id: "2",
        categoryName: "Computers & Printers",
        avatar: "https://cdn-icons-png.flaticon.com/512/3606/3606645.png",
        hasStory:false,
        title: "Computers & Printers",
        information: "Old computers and printers 🖥️🖨️ often pile up in homes and offices, but dumping them can harm the environment 🌍. These devices contain heavy metals, plastics, and toxic chemicals that can leak into the ground and water when left in landfills 💧⚠️. Burning them releases harmful gases, affecting air quality 😷. Instead of discarding them carelessly, hand them over to authorized e-waste recycling centers ♻️. These centers safely dismantle and recycle valuable parts while managing the hazardous waste responsibly 🔧🔁. Let's take a smart step toward a cleaner, greener future 🌱💚 — recycle your e-waste the right way! 🌎✨",
        routeSlug: 'Computer',
    },
    {
        id: "3",
        categoryName: "Mobile Phone",
        avatar: "https://cdn-icons-png.flaticon.com/512/186/186239.png",
        hasStory:false,
        title: "Mobile Phones",
        information: "Mobile phones 📱📶 have become a part of our daily lives, but when they become old or damaged, tossing them away can seriously harm the environment 🌍. These devices contain hazardous materials like lead, mercury, and lithium that can leak into the soil and water, causing pollution and health risks 💧⚠️. Instead of throwing them in the bin, hand over old phones to certified e-waste recycling centers ♻️. These centers safely recover useful components and dispose of harmful parts responsibly 🔁. Let’s recycle smart and protect our Earth 🌱💚. Your small action can make a big difference 🌎✨.",
        routeSlug: 'Mobile',
    },
    {
        id: "4",
        categoryName: "TelePhone",
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuz2zpJyzseII-gA0F4h0omQT7xS5ozw3Zog&s",
        hasStory:false,
        title: "Telephones",
        information: "Old electronic telephones ☎️📞 may seem outdated, but throwing them in the trash can be harmful to the environment 🌍. These devices contain wires, plastic, and electronic components that can leak toxic substances into the soil and water when not disposed of properly 💧⚠️. Instead of letting them gather dust or end up in landfills, hand them over to certified e-waste recycling centers ♻️. They ensure safe dismantling and recycling of valuable parts 🔁. Let’s act responsibly — give your unused telephones a second chance and help protect our planet for future generations 🌱💚🌎.",
        routeSlug: 'Telephone',
    },
    {
        id: "5",
        categoryName: "Remotes",
        avatar: "https://cdn-icons-png.flaticon.com/512/2604/2604119.png",
        hasStory:false,
        title: "Remotes",
        information: "Electronic remotes 📺🎮 may seem small, but when thrown away carelessly, they contribute to the growing e-waste problem 🌍. These devices often contain batteries, circuit boards, and plastic that can pollute the soil and water when dumped improperly 💧🛑. Instead of tossing them in the trash, hand over old or broken remotes to certified e-waste recycling centers ♻️. They ensure safe disposal and allow parts to be reused or recycled responsibly 🔁. Let’s make smart choices — even the tiniest gadgets deserve proper treatment! 🌱✨ Give your old remotes a green goodbye and protect our planet 💚🌎.",
        routeSlug: 'Remote',
    },
    {
        id: "6",
        categoryName: "Cables & Wires",
        avatar: "https://res.cloudinary.com/jerrick/image/upload/d_642250b563292b35f27461a7.png,f_jpg,fl_progressive,q_auto,w_1024/67f5137f21611a001df1d54d.jpg",
        hasStory:false,
        title: "Cables & Wires",
        information: "Old cables and wires 🧵🔌 often get tossed aside, but did you know they can harm the environment if not disposed of properly? Many of them contain copper, plastic, and even toxic materials that can leak into the soil and water when dumped in landfills 🌍💧. Burning them is even worse, releasing harmful fumes into the air 😷. Instead of discarding them, hand over unused cables and wires to certified e-waste collection centers ♻️. These centers recycle safely and help reduce electronic pollution 🌱. Every small action counts — let’s keep our planet clean and tech-friendly! 💚✨",
        routeSlug: 'Cables',
    },
    {
        id: "7",
        categoryName: "WIFI", // categoryName for the form (might differ from `title`)
        avatar: "https://cdn-icons-png.flaticon.com/512/3096/3096440.png",
        title: "WIFI Devices", // display title in list
        information:"Old WiFi routers and modems 📶 may seem harmless, but when tossed into landfills, they contribute to the growing problem of electronic waste 🌍. These devices contain plastic, metals, and circuits that can leak harmful substances into the soil and water 💧, damaging ecosystems and endangering wildlife 🐦. Instead of throwing them away, consider donating or handing them over to certified e-waste management centers ♻️. Responsible recycling not only keeps the environment safe but also allows valuable materials to be reused 🔄. Let’s protect our planet — one gadget at a time! 🌱💚",
        hasStory:false,
        routeSlug: 'WifiRouter',
    },
    {
        id: "8",
        categoryName: "Lithium Battery",
        avatar: "https://scionenergy.in/images/battery/Icon-02.png",
        title:"Lithium Battery",
        information: "Lithium batteries, commonly used in phones 📱, laptops 💻, and other devices, can be extremely harmful when thrown into the environment 🚯. If discarded carelessly, they leak toxic chemicals 🧪 like lithium and cobalt into the soil and water, polluting ecosystems 🌿 and endangering human health 🧑‍⚕️. These batteries can also catch fire 🔥 or explode 💥, causing serious safety risks. Instead of tossing them in regular bins 🚮, used batteries should be given to certified e-waste management centers ♻️. Proper recycling not only prevents environmental damage but also allows valuable materials to be reused 🔁. Always dispose of lithium batteries responsibly to protect the planet 🌱.",
        hasStory:false,
        routeSlug: 'LithiumBattery',
    },
    {
        id: "9",
        categoryName: "Micro oven & Fridge",
        avatar: "https://static.vecteezy.com/system/resources/previews/002/002/407/non_2x/fridge-and-microwave-oven-appliances-free-vector.jpg",
        title: "Micro oven & Fridge",
        information: "Old refrigerators, ovens, and other home appliances 🧊🔥 may look bulky, but tossing them out carelessly harms our environment 🌍. These devices often contain hazardous materials like refrigerants, heavy metals, and plastic that can leak into the soil and water 💧, polluting ecosystems and risking human health 🚫. Instead of dumping them, hand over these items to certified e-waste management services ♻️. They safely dismantle and recycle parts, reducing pollution and conserving resources 🔄. Let’s be responsible citizens 🙌— recycle your home appliances and give them a second life! 🏡🌱",
        hasStory:false,
        routeSlug: 'Appliances',
    },
];