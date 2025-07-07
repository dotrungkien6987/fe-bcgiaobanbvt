import { Skeleton, Stack, List, ListItem } from "@mui/material";

// ==============================|| NAVIGATION SKELETON ||============================== //

const NavSkeleton = ({ count = 5 }) => {
  return (
    <List sx={{ py: 0 }}>
      {Array.from({ length: count }).map((_, index) => (
        <ListItem key={index} sx={{ px: 1.25, py: 1, mx: 1.25, my: 0.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <Skeleton
              variant="rounded"
              width={24}
              height={24}
              sx={{
                borderRadius: 1,
                bgcolor: "grey.300",
                animation: "wave",
              }}
            />
            <Skeleton
              variant="text"
              width="70%"
              height={20}
              sx={{
                bgcolor: "grey.300",
                animation: "wave",
                animationDelay: `${index * 0.1}s`,
              }}
            />
          </Stack>
        </ListItem>
      ))}
    </List>
  );
};

export default NavSkeleton;
