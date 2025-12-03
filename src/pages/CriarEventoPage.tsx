import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { eventosService } from '../services/api/eventos';
import { useAuthStore } from '../stores/authStore';
import { canCreateEvents } from '../utils/userHelpers';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';
import './CriarEventoPage.css';

const eventoSchema = z
  .object({
    titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
    localizacao: z.string().min(3, 'Localização é obrigatória'),
    dataInicio: z.string().min(1, 'Data de início é obrigatória'),
    dataFim: z.string().min(1, 'Data de término é obrigatória'),
    imagemUrl: z.string().url('URL inválida').optional().or(z.literal('')),
    requerInscricao: z.boolean(),
  })
  .refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
    message: 'Data de término deve ser posterior à data de início',
    path: ['dataFim'],
  });

type EventoFormData = z.infer<typeof eventoSchema>;

export const CriarEventoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Verificar se o usuário pode criar eventos
  useEffect(() => {
    if (user) {
      if (!canCreateEvents(user)) {
        // Verificar se é promoter não aprovado
        const isPromoterNotApproved =
          (user.tipo === 'PROMOTER' || user.permissions?.includes('promoter')) &&
          !user.approvedAt;

        if (isPromoterNotApproved) {
          toast.error('Sua conta de promoter precisa ser aprovada antes de criar eventos');
          navigate('/perfil');
        } else {
          toast.error('Apenas promoters aprovados podem criar eventos');
          navigate('/');
        }
        return;
      }
    }
  }, [user, navigate]);

  const { data: eventoEdit } = useQuery({
    queryKey: ['evento', editId],
    queryFn: () => eventosService.getEvento(editId!),
    enabled: !!editId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      requerInscricao: false,
    },
  });

  useEffect(() => {
    if (eventoEdit) {
      reset({
        titulo: eventoEdit.titulo,
        descricao: eventoEdit.descricao,
        localizacao: eventoEdit.localizacao,
        dataInicio: new Date(eventoEdit.dataInicio).toISOString().slice(0, 16),
        dataFim: new Date(eventoEdit.dataFim).toISOString().slice(0, 16),
        imagemUrl: eventoEdit.imagemUrl || '',
        requerInscricao: eventoEdit.requerInscricao,
      });
    }
  }, [eventoEdit, reset]);

  const createMutation = useMutation({
    mutationFn: (data: EventoFormData) => eventosService.createEvento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meus-eventos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Evento criado com sucesso! Aguardando aprovação.');
      navigate('/meus-eventos');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erro ao criar evento';

      // Tratamento específico de erros da API
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error(errorMessage);
        navigate('/perfil');
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<EventoFormData>) =>
      eventosService.updateEvento(editId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evento', editId] });
      queryClient.invalidateQueries({ queryKey: ['meus-eventos'] });
      toast.success('Evento atualizado com sucesso!');
      navigate('/meus-eventos');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar evento');
    },
  });

  const onSubmit = (data: EventoFormData) => {
    const eventoData = {
      ...data,
      imagemUrl: data.imagemUrl || undefined,
    };

    if (editId) {
      updateMutation.mutate(eventoData);
    } else {
      createMutation.mutate(eventoData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="criar-evento-page">
      <div className="container">
        <Button variant="ghost" onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Voltar
        </Button>

        <Card className="criar-evento-card">
          <h1>{editId ? 'Editar Evento' : 'Criar Novo Evento'}</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="criar-evento-form">
            <div className="form-section">
              <h3>Informações Básicas</h3>
              <Input
                label="Título do evento"
                placeholder="Ex: Show de Rock"
                error={errors.titulo?.message}
                required
                {...register('titulo')}
              />

              <div className="form-group">
                <label className="form-label">
                  Descrição
                  <span className="input-required">*</span>
                </label>
                <textarea
                  className={`form-textarea ${errors.descricao ? 'input-error' : ''}`}
                  placeholder="Descreva seu evento..."
                  rows={6}
                  {...register('descricao')}
                />
                {errors.descricao && (
                  <span className="input-error-text">{errors.descricao.message}</span>
                )}
              </div>

              <Input
                label="Localização"
                placeholder="Ex: Teatro Municipal, São Paulo - SP"
                error={errors.localizacao?.message}
                required
                {...register('localizacao')}
              />
            </div>

            <div className="form-section">
              <h3>Data e Hora</h3>
              <div className="form-row">
                <Input
                  label="Data e hora de início"
                  type="datetime-local"
                  error={errors.dataInicio?.message}
                  required
                  {...register('dataInicio')}
                />
                <Input
                  label="Data e hora de término"
                  type="datetime-local"
                  error={errors.dataFim?.message}
                  required
                  {...register('dataFim')}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Imagem</h3>
              <Input
                label="URL da imagem"
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                error={errors.imagemUrl?.message}
                helperText="URL da imagem do evento (opcional)"
                {...register('imagemUrl')}
              />
            </div>

            <div className="form-section">
              <h3>Configurações</h3>
              <div className="form-checkbox-group">
                <input
                  type="checkbox"
                  id="requerInscricao"
                  {...register('requerInscricao')}
                  className="form-checkbox"
                />
                <label htmlFor="requerInscricao" className="form-checkbox-label">
                  Requer inscrição
                  <span className="form-checkbox-helper">
                    Se marcado, usuários precisarão se inscrever para participar
                  </span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" loading={isLoading}>
                {editId ? 'Salvar alterações' : 'Publicar evento'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

