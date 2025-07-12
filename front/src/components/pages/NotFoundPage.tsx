import { Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", pt: 10 }}>
      <Typography variant="h2" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        ページが見つかりません
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        お探しのページは存在しないか、移動された可能性があります。
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        トップページへ戻る
      </Button>
    </Container>
  );
};
