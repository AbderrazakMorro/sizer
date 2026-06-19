import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LandingContactForm } from "./_sections/landing-contact-form";
import { getAdminClient } from "@/lib/supabase/admin";
import { ArrowRight, Handshake, LayoutGrid, PenTool, ShoppingBag } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";

  return {
    title: isFr ? "SIZER - Architecture & Intérieur" : "SIZER - Architecture & Interior",
    description: isFr
      ? "Sizer est un cabinet de conseil créatif pluridisciplinaire basé à Casablanca, Maroc. Nous concevons des espaces qui inspirent."
      : "Sizer is a multidisciplinary creative consulting studio based in Casablanca, Morocco. We design spaces that inspire.",
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isFr = locale === "fr";

  let products: any[] = [];
  try {
    const adminSupabase = getAdminClient();
    const { data } = await adminSupabase
      .from("products")
      .select("*, supplier:suppliers(name)")
      .order("created_at", { ascending: false })
      .limit(6);
    if (data) {
      products = data;
    }
  } catch (error) {
    console.error("Error fetching products for landing page:", error);
  }

  return (
    <main className="bg-background text-on-surface select-none">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Hero Architecture Background"
            className="w-full h-full object-cover object-center opacity-40"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKBQ1BSkEo5lSXLx84r7260DRbqRu5zBCdJZjo_cDIj-x9VPXyniURMjCJY377Sy5-5mqm8Y3Htfcr5b5Jc8qcZV5zNYTetdxx0fAi-2LemWwBSlm3xhvT0g0SaeFvaqWGVa9IW5Of-d929nMjV2x7gaIkOrcYT75lWa755CRlFxLc8J8b4Hk8JdrE5QfypJHp9aBVm8GBUOJL_hOX8trFouBZD2K_kjgUMy_9dTCAjR62C-D-PEaMYkLEgR1cnXOmlsOgGttirmA"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background"></div>
        </div>
        <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-screen-xl mx-auto flex flex-col items-center">
          <h1 className="text-display-lg font-display-lg text-on-surface mb-6 uppercase tracking-tight text-4xl sm:text-6xl md:text-8xl">
            {isFr ? (
              <>
                CONCEVOIR DES ESPACES
                <br />
                QUI INSPIRENT
              </>
            ) : (
              <>
                DESIGNING SPACES
                <br />
                THAT INSPIRE
              </>
            )}
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant mb-10 uppercase tracking-widest text-xs sm:text-sm">
            {isFr ? "Architecture | Intérieur | Artisans" : "Architecture | Interior | Artisans"}
          </p>
          <a
            className="btn-primary px-8 py-4 text-label-sm font-label-sm uppercase tracking-[0.2em]"
            href="#projets"
          >
            {isFr ? "DÉCOUVRIR NOS PROJETS" : "DISCOVER OUR PROJECTS"}
          </a>
        </div>
        <div className="absolute bottom-12 left-margin-desktop hidden md:block">
          <div className="flex flex-col gap-4 text-label-sm font-label-sm text-on-surface-variant">
            <span>01</span>
            <div className="w-[1px] h-12 bg-outline-variant/50 mx-auto"></div>
            <span>05</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-screen-2xl mx-auto"
        id="apropos"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-5 md:col-start-1 pr-0 md:pr-12">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-10 uppercase text-3xl sm:text-4xl">
              {isFr ? "À PROPOS DE SIZER" : "ABOUT SIZER"}
            </h2>
            <p className="text-body-md font-body-md text-on-surface-variant mb-8 leading-relaxed">
              {isFr
                ? "Sizer est un cabinet de conseil créatif pluridisciplinaire basé à Casablanca, Maroc. Nous accompagnons nos clients à travers des projets de concepts, de design d'intérieur et de direction artistique, en apportant une vision globale et cohérente."
                : "Sizer is a multidisciplinary creative consulting studio based in Casablanca, Morocco. We support our clients through concepts, interior design, and art direction projects, bringing a coherent and global vision."}
            </p>
            <p className="text-body-md font-body-md text-on-surface-variant mb-12 leading-relaxed italic text-primary/80 font-serif">
              {isFr ? '"Créer avec sens, construire pour durer."' : '"Create with meaning, build to last."'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-outline-variant/30 pt-8">
              <div>
                <div className="text-headline-md font-headline-md text-primary mb-2 text-2xl">10+</div>
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase text-[10px]">
                  {isFr ? "Années d'expérience" : "Years of experience"}
                </div>
              </div>
              <div>
                <div className="text-headline-md font-headline-md text-primary mb-2 text-2xl">120+</div>
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase text-[10px]">
                  {isFr ? "Projets réalisés" : "Completed projects"}
                </div>
              </div>
              <div>
                <div className="text-headline-md font-headline-md text-primary mb-2 text-2xl">50+</div>
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase text-[10px]">
                  {isFr ? "Artisans partenaires" : "Artisan partners"}
                </div>
              </div>
              <div>
                <div className="text-headline-md font-headline-md text-primary mb-2 text-2xl">1</div>
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase text-[10px]">
                  {isFr ? "Vision globale" : "Global vision"}
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 mt-12 md:mt-0">
            <div className="relative h-[800px] w-full overflow-hidden">
              <img
                alt="Interior Architecture Concept"
                className="w-full h-full object-cover grayscale-[0.3] contrast-125"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCedIT2q4flgSHeODWITGJXfwryIR5d74lyvRvckJr1k4vk2q_yxF0O_5nRcgGp2piVRjHPtWGW_rOxkRtc1_-4tVNq0DYwbEdgpnGgU8-PyhqjVaBVX_E3U7z6Z1Db--shpvGN2SOmpoWdQ37eVj_fN7SjkkRfKOSYRQ4JapOcWRFT0XbMs9MzO3-LQv5bevFfYN79Ur5oxsbMs-zEkDrIPAO6ku3mvHeBE8Xtr754jtXww0CfzsUbwxkLvfLI7L15G380v5sovMo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low/50"
        id="projets"
      >
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-on-surface uppercase mb-4 text-3xl sm:text-4xl">
                {isFr ? "NOS PROJETS" : "OUR PROJECTS"}
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant max-w-md">
                {isFr
                  ? "Une sélection de projets d'architecture et d'intérieurs pensés avec sensibilité et précision."
                  : "A selection of architectural and interior projects designed with sensitivity and precision."}
              </p>
            </div>
            <div className="flex flex-wrap gap-8 mt-8 md:mt-0 border-b border-outline-variant/30 pb-2">
              <button className="text-label-sm font-label-sm uppercase tracking-widest text-primary border-b border-primary pb-2 -mb-[3px] cursor-pointer">
                {isFr ? "TOUT" : "ALL"}
              </button>
              <button className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                ARCHITECTURE
              </button>
              <button className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                {isFr ? "INTÉRIEUR" : "INTERIOR"}
              </button>
              <button className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                {isFr ? "DIRECTION ARTISTIQUE" : "ART DIRECTION"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Project 1 */}
            <div className="group cursor-pointer">
              <div className="relative h-[400px] mb-6 overflow-hidden img-zoom-hover">
                <img
                  alt="VILLA N. Architecture"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTbLM5W0Ou2y7U8BI0urW0ophSIn5EEHgnbVcayNQRS_oJVWrZehFjPCTET5zhgLa3AddXUHEdwLB6ZBv1ATdVuxboW6fpVr88tJ4zIVYtAu7-xH8plutX7hh0LfCUw1zB-TU2BHv742nX7rlPzCT3RMA17eaUF1da-fm3ScL6LbUf4QyVVI7jt6KzLc1qG4gQbOFE5WvJeEDJO5jF_Efz5P9JNSy75gwnY3F-219ZjU4BQaOEXaxgyfQ8qhienZZnGoju9CGtSKc"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface uppercase mb-1 text-xl sm:text-2xl">
                VILLA N.
              </h3>
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                Architecture
              </p>
            </div>
            {/* Project 2 */}
            <div className="group cursor-pointer">
              <div className="relative h-[400px] mb-6 overflow-hidden img-zoom-hover">
                <img
                  alt="MAISON M. Intérieur"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV-86aI4T6WFLRuhU75MXapYIbUnMkm5Di7zJeEIbsX4M7iFi06J_qcVZlkDlk1LjEGpdLWtW7Dvtf8sZGWFwtByncEPx1YLLD5vMbHjhku9acM-JMymb_6Y7bCaXbMdt3vbwDtRVnwmNHLPQaPsg4alUE_6x2yLFYZAHnox-4abZ6h55hD56bev3SOjGroXDJxCe1_YdEzWsbAKNI06ey4gHNMmVrSawZdtV6A_IqaFg7Ds_k_ynOqSF5C48dNMj4uinDb1nxDNQ"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface uppercase mb-1 text-xl sm:text-2xl">
                MAISON M.
              </h3>
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                {isFr ? "Intérieur" : "Interior"}
              </p>
            </div>
            {/* Project 3 */}
            <div className="group cursor-pointer">
              <div className="relative h-[400px] mb-6 overflow-hidden img-zoom-hover">
                <img
                  alt="BUREAU K. Direction Artistique"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0iS1JFWmBnSkdMDL9ZkVmfEagqV_v-wIJKelbOnwk8ptMVVsPhy7ShIq3-OQRcnhpcD_mZnOSn9sKS2KRigIs2A0IEM2DAUvRaqMVDvTqJu0Cpzk0I6eNhrAziijS3XP_SumYok6p0zH8T-c9yXn_p_RJunGfP5ZJ_XSwDjSj7hrhryXKB-q_AeKXxkF2oTvwU9oYF0XP0LXC66qiHIVjKt9BWkTudkfCdqLuaV9UebTMEhD8_YZJnY-7d_a19W_1sFLA8PKOQJE"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface uppercase mb-1 text-xl sm:text-2xl">
                BUREAU K.
              </h3>
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                {isFr ? "Direction Artistique" : "Art Direction"}
              </p>
            </div>
          </div>
          <div className="mt-16 flex justify-center">
            <a
              className="text-label-sm font-label-sm uppercase tracking-[0.2em] text-on-surface border-b border-outline-variant/50 pb-1 hover:text-primary hover:border-primary transition-all"
              href="#"
            >
              {isFr ? "VOIR TOUS LES PROJETS" : "VIEW ALL PROJECTS"}
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-screen-2xl mx-auto"
        id="services"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-4">
            <h2 className="text-headline-lg font-headline-lg text-on-surface uppercase mb-8 text-3xl sm:text-4xl">
              {isFr ? "NOS SERVICES" : "OUR SERVICES"}
            </h2>
            <p className="text-body-md font-body-md text-on-surface-variant max-w-xs">
              {isFr
                ? "Une approche pluridisciplinaire pour des projets sur-mesure."
                : "A multidisciplinary approach for tailor-made projects."}
            </p>
          </div>
          <div className="md:col-span-8 mt-12 md:mt-0">
            <div className="flex flex-col border-t border-outline-variant/30">
              {/* Service Item 1 */}
              <div className="py-10 border-b border-outline-variant/30 group hover:bg-surface-container-low/30 transition-colors px-4 -mx-4 cursor-pointer flex items-start">
                <LayoutGrid className="text-primary mr-8 w-9 h-9" aria-hidden />
                <div className="flex-1">
                  <h3 className="text-headline-md font-headline-md text-on-surface uppercase mb-2 text-xl sm:text-2xl">
                    Architecture
                  </h3>
                  <p className="text-body-md font-body-md text-on-surface-variant max-w-lg">
                    {isFr
                      ? "Conception architecturale, études de faisabilité et suivi de chantier."
                      : "Architectural design, feasibility studies, and construction supervision."}
                  </p>
                </div>
                <ArrowRight
                  className="text-on-surface-variant group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 duration-300 mt-1"
                  aria-hidden
                />
              </div>
              {/* Service Item 2 */}
              <div className="py-10 border-b border-outline-variant/30 group hover:bg-surface-container-low/30 transition-colors px-4 -mx-4 cursor-pointer flex items-start">
                <PenTool className="text-primary mr-8 w-9 h-9" aria-hidden />
                <div className="flex-1">
                  <h3 className="text-headline-md font-headline-md text-on-surface uppercase mb-2 text-xl sm:text-2xl">
                    {isFr ? "Design d'intérieur" : "Interior Design"}
                  </h3>
                  <p className="text-body-md font-body-md text-on-surface-variant max-w-lg">
                    {isFr
                      ? "Aménagement d'espaces intérieurs, choix des matériaux, mobilier sur-mesure."
                      : "Interior space layout, material choice, custom furniture design."}
                  </p>
                </div>
                <ArrowRight
                  className="text-on-surface-variant group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 duration-300 mt-1"
                  aria-hidden
                />
              </div>
              {/* Service Item 3 */}
              <div className="py-10 border-b border-outline-variant/30 group hover:bg-surface-container-low/30 transition-colors px-4 -mx-4 cursor-pointer flex items-start">
                <PenTool className="text-primary mr-8 w-9 h-9" aria-hidden />
                <div className="flex-1">
                  <h3 className="text-headline-md font-headline-md text-on-surface uppercase mb-2 text-xl sm:text-2xl">
                    {isFr ? "Direction Artistique" : "Art Direction"}
                  </h3>
                  <p className="text-body-md font-body-md text-on-surface-variant max-w-lg">
                    {isFr
                      ? "Création d'identité visuelle, stylisme d'espace et scénographie."
                      : "Visual identity creation, space styling, and scenography."}
                  </p>
                </div>
                <ArrowRight
                  className="text-on-surface-variant group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 duration-300 mt-1"
                  aria-hidden
                />
              </div>
              {/* Service Item 4 */}
              <div className="py-10 border-b border-outline-variant/30 group hover:bg-surface-container-low/30 transition-colors px-4 -mx-4 cursor-pointer flex items-start">
                <Handshake className="text-primary mr-8 w-9 h-9" aria-hidden />
                <div className="flex-1">
                  <h3 className="text-headline-md font-headline-md text-on-surface uppercase mb-2 text-xl sm:text-2xl">
                    {isFr ? "Conseil & Accompagnement" : "Consulting & Support"}
                  </h3>
                  <p className="text-body-md font-body-md text-on-surface-variant max-w-lg">
                    {isFr
                      ? "Expertise technique et créative à chaque étape de votre projet."
                      : "Technical and creative expertise at every stage of your project."}
                  </p>
                </div>
                <ArrowRight
                  className="text-on-surface-variant group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 duration-300 mt-1"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section
        className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low/20 border-t border-outline-variant/10"
        id="catalogue"
      >
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-on-surface uppercase mb-4 text-3xl sm:text-4xl">
                {isFr ? "NOTRE CATALOGUE" : "OUR CATALOG"}
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant max-w-md">
                {isFr
                  ? "Explorez notre sélection de mobilier, luminaires et objets d'art disponibles pour nos projets."
                  : "Explore our selection of furniture, lighting, and art objects available for our projects."}
              </p>
            </div>
            <div>
              <a
                className="btn-primary flex items-center gap-2 px-6 py-3 text-label-sm font-label-sm uppercase tracking-wider text-xs"
                href="/sizer-app/catalog"
              >
                <ShoppingBag className="h-4 w-4" />
                {isFr ? "VOIR TOUT LE CATALOGUE" : "VIEW FULL CATALOG"}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {products.length === 0 ? (
              // Fallback Mock products if database is empty
              [
                { id: "1", name: "Chaise Ocre", category: "Mobilier", reference_code: "CH-OCR", image_url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=300&auto=format&fit=crop" },
                { id: "2", name: "Suspension Laiton", category: "Luminaire", reference_code: "SU-LAI", image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=300&auto=format&fit=crop" },
                { id: "3", name: "Vase Céramique", category: "Décoration", reference_code: "VA-CER", image_url: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=300&auto=format&fit=crop" },
                { id: "4", name: "Table Basse Noyer", category: "Mobilier", reference_code: "TA-NOY", image_url: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=300&auto=format&fit=crop" },
                { id: "5", name: "Fauteuil Velours", category: "Mobilier", reference_code: "FA-VEL", image_url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=300&auto=format&fit=crop" },
                { id: "6", name: "Applique Minimaliste", category: "Luminaire", reference_code: "AP-MIN", image_url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=300&auto=format&fit=crop" }
              ].map((product) => (
                <div key={product.id} className="group bg-surface-container-low border border-outline-variant/20 p-4 flex flex-col justify-between hover:border-primary transition-all duration-300">
                  <div className="relative aspect-square w-full mb-4 overflow-hidden bg-background">
                    <img
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={product.image_url}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-primary uppercase tracking-widest block mb-1">
                      {product.category}
                    </span>
                    <h3 className="text-body-md font-semibold truncate text-on-surface mb-1 uppercase text-sm">
                      {product.name}
                    </h3>
                    <code className="text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">
                      {product.reference_code}
                    </code>
                  </div>
                </div>
              ))
            ) : (
              products.map((product) => (
                <div key={product.id} className="group bg-surface-container-low border border-outline-variant/20 p-4 flex flex-col justify-between hover:border-primary transition-all duration-300">
                  <div className="relative aspect-square w-full mb-4 overflow-hidden bg-background flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={product.image_url}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Sans image</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-primary uppercase tracking-widest block mb-1">
                      {product.category || (isFr ? "Produit" : "Product")}
                    </span>
                    <h3 className="text-body-md font-semibold truncate text-on-surface mb-1 uppercase text-sm">
                      {product.name}
                    </h3>
                    {product.reference_code && (
                      <code className="text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">
                        {product.reference_code}
                      </code>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className="relative py-section-gap bg-background border-t border-outline-variant/10"
        id="contact"
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#4b463d 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-24">
          {/* Contact Info */}
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface uppercase mb-12 text-3xl sm:text-4xl">
              CONTACT
            </h2>
            <p className="text-body-md font-body-md text-on-surface-variant mb-12 max-w-md">
              {isFr
                ? "Discutons de votre projet. Nous sommes basés à Casablanca, Maroc, et intervenons sur des projets locaux et internationaux."
                : "Let's discuss your project. We are based in Casablanca, Morocco, and work on local and international projects."}
            </p>
            <div className="flex flex-col gap-6">
              <div className="flex items-center group">
                <span className="material-symbols-outlined text-primary mr-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  mail
                </span>
                <a
                  className="text-body-md font-body-md text-on-surface hover:text-primary transition-colors"
                  href="mailto:hello@sizer.ma"
                >
                  hello@sizer.ma
                </a>
              </div>
              <div className="flex items-center group">
                <span className="material-symbols-outlined text-primary mr-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  phone
                </span>
                <a
                  className="text-body-md font-body-md text-on-surface hover:text-primary transition-colors"
                  href="tel:+212600000000"
                >
                  +212 6 00 00 00 00
                </a>
              </div>
              <div className="flex items-start group">
                <span className="material-symbols-outlined text-primary mr-4 opacity-70 group-hover:opacity-100 transition-opacity mt-1">
                  location_on
                </span>
                <p className="text-body-md font-body-md text-on-surface">
                  Casablanca, Maroc
                  <br />
                  <span className="text-sm text-on-surface-variant">
                    {isFr ? "Sur rendez-vous uniquement" : "By appointment only"}
                  </span>
                </p>
              </div>
            </div>
          </div>
          {/* Form */}
          <div className="bg-surface-container-low/40 p-8 md:p-12 backdrop-blur-sm border border-outline-variant/20">
            <LandingContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
