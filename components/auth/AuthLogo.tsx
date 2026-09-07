import Image from "next/image";

export default function AuthLogo() {
  return (
    <div className="relative flex justify-center mb-8">
      <div className="absolute w-20 h-20 rounded-full bg-lumen-gold/25 blur-2xl" />
      <Image
        src="/logo.png"
        alt="Lumanova"
        width={64}
        height={64}
        priority
        className="relative w-16 h-16 drop-shadow-[0_0_18px_rgba(244,196,48,0.35)]"
      />
    </div>
  );
}
