import React, { FC, useRef, useState } from "react";
import "./ImageGenerator.css";
import { styled } from "@mui/material/styles";
import default_image from "../../assets/default_image.svg";
import {
  Button,
  ButtonProps,
  Stack,
  TextField,
  Typography,
  Skeleton,
  Snackbar,
  Alert,
} from "@mui/material";
import { purple } from "@mui/material/colors";

const ColorButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: purple[500],
  padding: 10,
  width: 150,
  "&:hover": {
    backgroundColor: purple[700],
  },
}));

const ImageGenerator: FC = () => {
  const [imgUrl, setImgUrl] = useState("/");
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [snackBar, setSnackbar] = useState(false);
  const [textValue, setTextValue] = useState("");

  const openSnackbar = () => {
    setSnackbar(true);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar(false);
  };

  const imageGenerator = async () => {
    if (!inputRef.current || inputRef.current.value === "") {
      return 0;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_OPEN_AI_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPEN_AI_API_KEY}`,
          "User-Agent": "Chrome",
        },
        body: JSON.stringify({
          prompt: `${inputRef.current.value}`,
          n: 1,
          size: "512x512",
        }),
      });

      // Check if the response is not okay (e.g., not a 2xx status)
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      const dataArray = data.data;
      setImgUrl(dataArray[0].url);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      openSnackbar();
      // Here you could potentially set some state to show an error message to the user
      // setError("There was an issue generating the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h2">
        AI Image{" "}
        <span style={{ color: "#DE1B89", fontWeight: 600 }}>Generator</span>{" "}
      </Typography>
      <Stack sx={{ backgroundColor: "white", p: 3, borderRadius: 4 }}>
        {loading ? (
          <Skeleton variant="rectangular" width={547} height={547} />
        ) : (
          <img
            src={imgUrl === "/" ? default_image : imgUrl}
            alt="default img"
          />
        )}
        <TextField
          id="standard-basic"
          ref={inputRef}
          label="Describe what you wanna see"
          margin="normal"
          variant="outlined"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)} // update textValue on each change
          InputProps={{
            endAdornment: (
              <ColorButton
                onClick={() => {
                  imageGenerator();
                }}
                disabled={loading || !textValue}
              >
                Generate
              </ColorButton>
            ),
          }}
        />
        <Snackbar
          open={snackBar}
          autoHideDuration={1000}
          onClose={handleClose}
          key={"bottom center"}
        >
          <Alert severity="error">Error fetching data.</Alert>
        </Snackbar>
      </Stack>
    </>
  );
};

export default ImageGenerator;
