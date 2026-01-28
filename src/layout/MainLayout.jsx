import Sidebar from "../sidebar/sidebar";

export default function MainLayout({ children }) {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.content}>{children}</main>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    width: "100%",
    height: "100vh",
    background: "#f8fafc",
  },
  content: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  },
};
