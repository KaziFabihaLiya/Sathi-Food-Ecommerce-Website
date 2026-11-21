import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
