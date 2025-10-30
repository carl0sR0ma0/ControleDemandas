"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface NotifyDemandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    includeReporter: boolean;
    includeRequester: boolean;
    includeResponsible: boolean;
    additionalEmails?: string[];
    message?: string;
  }) => void;
  isLoading?: boolean;
  requesterName?: string;
  responsibleName?: string;
}

export function NotifyDemandDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  requesterName,
  responsibleName,
}: NotifyDemandDialogProps) {
  const [includeReporter, setIncludeReporter] = useState(false);
  const [includeRequester, setIncludeRequester] = useState(true);
  const [includeResponsible, setIncludeResponsible] = useState(false);
  const [additionalEmailsText, setAdditionalEmailsText] = useState("");
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    const additionalEmails = additionalEmailsText
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    onConfirm({
      includeReporter,
      includeRequester,
      includeResponsible,
      additionalEmails: additionalEmails.length > 0 ? additionalEmails : undefined,
      message: message.trim() || undefined,
    });

    // Reset form
    setIncludeReporter(false);
    setIncludeRequester(true);
    setIncludeResponsible(false);
    setAdditionalEmailsText("");
    setMessage("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setIncludeReporter(false);
    setIncludeRequester(true);
    setIncludeResponsible(false);
    setAdditionalEmailsText("");
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notificar Demanda</DialogTitle>
          <DialogDescription>
            Selecione os destinatários e adicione uma mensagem personalizada (opcional).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Destinatários</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeRequester"
                checked={includeRequester}
                onCheckedChange={(checked) => setIncludeRequester(checked === true)}
              />
              <Label htmlFor="includeRequester" className="cursor-pointer">
                Solicitante {requesterName && `(${requesterName})`}
              </Label>
            </div>

            {responsibleName && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeResponsible"
                  checked={includeResponsible}
                  onCheckedChange={(checked) => setIncludeResponsible(checked === true)}
                />
                <Label htmlFor="includeResponsible" className="cursor-pointer">
                  Responsável ({responsibleName})
                </Label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalEmails">E-mails Adicionais</Label>
            <Input
              id="additionalEmails"
              placeholder="email1@exemplo.com, email2@exemplo.com"
              value={additionalEmailsText}
              onChange={(e) => setAdditionalEmailsText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separe múltiplos e-mails com vírgula
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem Personalizada (Opcional)</Label>
            <Textarea
              id="message"
              placeholder="Digite uma mensagem para incluir na notificação..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
