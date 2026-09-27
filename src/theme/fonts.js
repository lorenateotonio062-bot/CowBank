// TT Interphases é uma fonte PAGA da fundição TypeType (typetype.org).
// Não é possível baixar e incluir os arquivos automaticamente por licença.
// Os títulos roxos do app (ex: "Criar um novo grupo", "Registrar bovino")
// usam Poppins Bold como substituta enquanto a fonte oficial não é adicionada.
//
// Para usar a fonte original:
// 1. Adquira a licença em https://typetype.org/fonts/tt-interphases-pro/
// 2. Coloque os arquivos .ttf em assets/fonts/ com estes nomes:
//      TTInterphases-Bold.ttf
//      TTInterphases-SemiBold.ttf
// 3. Descomente as duas linhas marcadas com "TT INTERPHASES" logo abaixo,
//    dentro de useAppFonts()
// 4. Troque os valores de "tituloRoxo" e "tituloRoxoSemiBold" em `fontes`
//    para 'TTInterphases-Bold' e 'TTInterphases-SemiBold'

export const fontes = {
  tituloRoxo: 'Poppins-Bold', // trocar para 'TTInterphases-Bold' quando a fonte for adicionada
  tituloRoxoSemiBold: 'Poppins-SemiBold', // trocar para 'TTInterphases-SemiBold'

  campo: 'Inter-Regular', // texto dentro de inputs e retângulos arredondados
  campoMedio: 'Inter-Medium',
  botao: 'Inter-SemiBold', // texto de botões arredondados

  padrao: 'Poppins-Regular', // texto padrão do app
  padraoMedio: 'Poppins-Medium',
  padraoSemiBold: 'Poppins-SemiBold',
  padraoBold: 'Poppins-Bold',
};

export function useAppFonts() {
  return true;
}
