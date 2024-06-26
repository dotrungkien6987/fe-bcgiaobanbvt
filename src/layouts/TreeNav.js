// TreeNav.jsx
import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore, Home, Info, Work, ContactMail } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledList = styled('div')(({ theme }) => ({
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
}));

const StyledNestedList = styled('div')({
    paddingLeft: 20,
});

const TreeNav = () => {
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <StyledList>
            <List>
                <ListItem button onClick={handleClick}>
                    <ListItemIcon>
                        <Home />
                    </ListItemIcon>
                    <ListItemText primary="Trang chủ" />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <StyledNestedList>
                        <List component="div" disablePadding>
                            <ListItem button>
                                <ListItemIcon>
                                    <Info />
                                </ListItemIcon>
                                <ListItemText primary="Giới thiệu" />
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <Work />
                                </ListItemIcon>
                                <ListItemText primary="Dịch vụ" />
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <ContactMail />
                                </ListItemIcon>
                                <ListItemText primary="Liên hệ" />
                            </ListItem>
                        </List>
                    </StyledNestedList>
                </Collapse>
            </List>
        </StyledList>
    );
};

export default TreeNav;