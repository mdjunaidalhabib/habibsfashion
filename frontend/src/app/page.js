"use client";
import ImageSlider from "../../components/home/ImageSlider";
import HomeCategorySections from "../../components/home/HomeCategorySections";


export default function HomePage() {
  return (
    <section className="bg-teal-50 ">
      <div>
        <ImageSlider />
        <HomeCategorySections />
      </div>
    </section>
  );
}
