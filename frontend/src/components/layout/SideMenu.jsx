import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SideMenu = ({menuItems}) => {

    const location = useLocation();

    const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);

    const handleMenuItemClick = (menuItemUrl) => {
        setActiveMenuItem(menuItemUrl);
    };


    return (

        <div className="list-group mt-5 pl-4">
            {menuItems?.map((menuItems,index) => (
                <Link
                key = {index}
                to={menuItems.url}
                className={`fw-bold list-group-item list-group-item-action" ${activeMenuItem.includes(menuItems.url) ? "active" : ""}`}
                onClick={() => handleMenuItemClick(menuItems.url)}
                //current active element
                aria-current={
                    activeMenuItem.includes(menuItems.url) ? "true" : "false"
                }
                >
                <i className= {`${menuItems.icon} fa-fw pe-2`}></i>{menuItems.name}
                </Link>
            ))}
        </div>
    );
};

export default SideMenu;