import Image from "next/image";

export default function AuthLogo() {
  return (
    <div className="relative flex justify-center mb-8">
      <div className="absolute w-32 h-32 rounded-full bg-lumen-gold/25 blur-2xl" />
      <Image
        src="/logo.png"
        alt="Lumanova"
        width={96}
        height={96}
        priority
        className="relative w-24 h-24 drop-shadow-[0_0_18px_rgba(244,196,48,0.35)]"
      />
    </div>
  );
}
