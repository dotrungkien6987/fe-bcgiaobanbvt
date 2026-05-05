import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const treeData = [
  {
    id: "khoacapcuu",
    name: "Khoa cấp cứu",
    children: [],
  },
  {
    id: "khoakhambenh",
    name: "Khoa khám bệnh",
    children: [],
  },

  {
    id: "hengoai",
    name: "Hệ ngoại",
    children: [
      {
        id: "tongtruchengoai",
        name: "BC tổng trực",
      },
      {
        id: "ngoaigiohengoai",
        name: "Vào viện ngoài giờ",
      },
    ],
  },

  {
    id: "henoi",
    name: "Hệ nội",
    children: [
      {
        id: "tongtruchenoi",
        name: "BC tổng trực",
      },
      {
        id: "ngoaigiohenoi",
        name: "Vào viện ngoài giờ",
      },
    ],
  },

  {
    id: "cc115",
    name: "Trung tâm cấp cứu 115",
    children: [
      {
        id: "tinhhinhchungcc115",
        name: "Tình hình chung",
      },
    ],
  },

  {
    id: "trungtamclc",
    name: "Trung tâm KCB CLC",
    children: [
      {
        id: "tinhhinhchungclc",
        name: "Tình hình chung",
      },
      {
        id: "phongkhamyc",
        name: "Phòng khám yêu cầu",
      },
      {
        id: "ngoaigioclc",
        name: "Vào viện ngoài giờ",
      },
    ],
  },

  {
    id: "canlamsang",
    name: "BC cận lâm sàng",
    children: [],
  },
  // ... thêm các nút và phần tử con khác ở đây
];

const RenderMenuItem = ({ nodes, level = 0, handleScroll }) => {
  const [open, setOpen] = useState(false);

  const hasChildren =
    nodes && Array.isArray(nodes.children) && nodes.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    }
    handleScroll(nodes.id);
  };

  return (
    <>
      <MenuItem onClick={handleClick}>
        <ListItemIcon
          style={{ minWidth: "30px", marginLeft: `${level * 20}px` }}
        >
          {hasChildren ? (
            open ? (
              <ArrowDropDownIcon />
            ) : (
              <ArrowRightIcon />
            )
          ) : null}
        </ListItemIcon>
        {nodes.name}
      </MenuItem>
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {nodes.children.map((childNode) => (
            <RenderMenuItem
              key={childNode.id}
              nodes={childNode}
              level={level + 1}
              handleScroll={handleScroll}
            />
          ))}
        </Collapse>
      )}
    </>
  );
};

function CustomMenu({ handleScroll }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {treeData.map((node) => (
          <RenderMenuItem
            key={node.id}
            nodes={node}
            handleScroll={handleScroll}
          />
        ))}
      </Menu>
    </div>
  );
}

export default CustomMenu;
