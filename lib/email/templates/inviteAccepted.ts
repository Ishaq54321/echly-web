import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailParagraphV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface InviteAcceptedProps {
  inviterFirstName: string;
  acceptedByName: string;
  acceptedByEmail: string;
  workspaceName: string;
  memberCount: number;
  workspaceMembersUrl: string;
}

export function inviteAcceptedEmailHtml(props: InviteAcceptedProps): string {
  const inviter = escapeEmailHtml(props.inviterFirstName);
  const acceptedBy = escapeEmailHtml(props.acceptedByName);
  const acceptedEmail = escapeEmailHtml(props.acceptedByEmail);
  const workspace = escapeEmailHtml(props.workspaceName);

  return emailShellV2({
    preheader: `${props.acceptedByName} joined ${props.workspaceName}.`,
    category: "Workspace update",
    title: `${props.acceptedByName} joined your workspace`,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${inviter},`)}
        ${emailParagraphV2(
          `<strong>${acceptedBy}</strong> (${acceptedEmail}) just accepted your invitation and joined "<strong>${workspace}</strong>".`
        )}
        ${emailParagraphV2(
          `Your workspace now has ${props.memberCount} ${
            props.memberCount === 1 ? "member" : "members"
          }. Everyone with access can collaborate on captures and feedback.`
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "View members", href: props.workspaceMembersUrl })
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function inviteAcceptedEmailText(props: InviteAcceptedProps): string {
  const memberWord = props.memberCount === 1 ? "member" : "members";
  return plainTextShellV2({
    body: `Hey ${props.inviterFirstName},

${props.acceptedByName} (${props.acceptedByEmail}) just accepted your invitation and joined "${props.workspaceName}".

Your workspace now has ${props.memberCount} ${memberWord}. Everyone with access can collaborate on captures and feedback.

View members: ${props.workspaceMembersUrl}

— Annote`,
  });
}
