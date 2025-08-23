{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.pnpm
    pkgs.nodePackages.typescript
    pkgs.nodePackages.typescript-language-server
    pkgs.git
  ];
}
