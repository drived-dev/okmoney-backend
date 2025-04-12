export function getSmsCredit(rolePackage) {
  switch (rolePackage) {
    case 'FREE':
      return 20;
    case 'SMALL':
      return 60;
    case 'MEDIUM':
      return 100;
    case 'LARGE':
      return 200;
    default:
      return 0;
  }
}
