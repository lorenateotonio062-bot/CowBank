import { useState } from 'react';

import Topo from '../components/criarconta/Topo';
import NovaConta from '../components/criarconta/NovaConta';
import TelaBase from '../components/comuns/TelaBase';
import { criarConta } from '../db/database';
import { cores } from '../theme/colors';

export default function CriarContaScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleCadastrar() {
    if (!nome.trim() || !email.trim() || !senha) {
      setErro('Preencha nome, email e senha.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      await criarConta({ nome: nome.trim(), email: email.trim(), senha, dataNascimento });
      // Criar a conta já deixa a pessoa logada, então vamos direto para o app.
      navigation.reset({ index: 0, routes: [{ name: 'Inicial' }] });
    } catch (e) {
      setErro(e.message || 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaBase backgroundColor={cores.verde}>
      <Topo />
      <NovaConta
        nome={nome}
        email={email}
        senha={senha}
        dataNascimento={dataNascimento}
        onChangeNome={setNome}
        onChangeEmail={setEmail}
        onChangeSenha={setSenha}
        onChangeDataNascimento={setDataNascimento}
        onSubmit={handleCadastrar}
        erro={erro}
        carregando={carregando}
      />
    </TelaBase>
  );
}
