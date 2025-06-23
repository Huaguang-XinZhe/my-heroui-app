import {
  FaBars,
  FaXmark,
  FaClockRotateLeft,
  FaAt,
  FaGear,
  FaInbox,
  FaKey,
  FaArrowsRotate,
  FaCircle,
  FaEnvelope,
  FaPaperPlane,
  FaFileLines,
  FaRightToBracket,
  FaMagnifyingGlass,
  FaArrowsLeftRight,
  FaPlus,
  FaCirclePlus,
  FaCheck,
  FaStop,
  FaPlay,
  FaTriangleExclamation,
  FaRegCopy,
  FaRegClock,
  FaEye,
  FaCode,
  FaTrashCan,
  FaBell,
  FaBellSlash,
  FaChevronLeft,
  FaChevronRight,
  FaUpload,
  FaShield,
  FaDatabase,
} from "react-icons/fa6";
import { TbInfoCircle } from "react-icons/tb";

interface IconProps {
  className?: string;
  [key: string]: any;
}

// 定义所有图标组件
export const IconBars = ({ className }: IconProps) => (
  <FaBars className={className} />
);
export const IconClose = ({ className }: IconProps) => (
  <FaXmark className={className} />
);
export const IconHistory = ({ className }: IconProps) => (
  <FaClockRotateLeft className={className} />
);
export const IconAt = ({ className }: IconProps) => (
  <FaAt className={className} />
);
export const IconSettings = ({ className }: IconProps) => (
  <FaGear className={className} />
);
export const IconInbox = ({ className }: IconProps) => (
  <FaInbox className={className} />
);
export const IconKey = ({ className }: IconProps) => (
  <FaKey className={className} />
);
export const IconRefresh = ({ className }: IconProps) => (
  <FaArrowsRotate className={className} />
);
export const IconCircle = ({ className }: IconProps) => (
  <FaCircle className={className} />
);
export const IconEnvelope = ({ className }: IconProps) => (
  <FaEnvelope className={className} />
);
export const IconPaperPlane = ({ className }: IconProps) => (
  <FaPaperPlane className={className} />
);
export const IconCopy = ({ className }: IconProps) => (
  <FaRegCopy className={className} />
);
export const IconClock = ({ className }: IconProps) => (
  <FaRegClock className={className} />
);
export const IconFile = ({ className }: IconProps) => (
  <FaFileLines className={className} />
);
export const IconLogin = ({ className }: IconProps) => (
  <FaRightToBracket className={className} />
);
export const IconSearch = ({ className }: IconProps) => (
  <FaMagnifyingGlass className={className} />
);
export const IconExchange = ({ className }: IconProps) => (
  <FaArrowsLeftRight className={className} />
);
export const IconPlus = ({ className }: IconProps) => (
  <FaPlus className={className} />
);
export const IconPlusCircle = ({ className }: IconProps) => (
  <FaCirclePlus className={className} />
);
export const IconCheck = ({ className }: IconProps) => (
  <FaCheck className={className} />
);
export const IconStop = ({ className }: IconProps) => (
  <FaStop className={className} />
);
export const IconPlay = ({ className }: IconProps) => (
  <FaPlay className={className} />
);
export const IconWarning = ({ className }: IconProps) => (
  <FaTriangleExclamation className={className} />
);
export const IconEye = ({ className }: IconProps) => (
  <FaEye className={className} />
);

export const IconInfoCircle = ({ className, ...props }: IconProps) => (
  <TbInfoCircle className={className} {...props} />
);

export const IconCode = ({ className }: IconProps) => (
  <FaCode className={className} />
);

export const IconTrash = ({ className }: IconProps) => (
  <FaTrashCan className={className} />
);

export const IconSubscribe = ({ className }: IconProps) => (
  <FaBell className={className} />
);

export const IconUnsubscribe = ({ className }: IconProps) => (
  <FaBellSlash className={className} />
);

export const IconChevronLeft = ({ className }: IconProps) => (
  <FaChevronLeft className={className} />
);

export const IconChevronRight = ({ className }: IconProps) => (
  <FaChevronRight className={className} />
);

export const IconUpload = ({ className }: IconProps) => (
  <FaUpload className={className} />
);

export const IconShield = ({ className }: IconProps) => (
  <FaShield className={className} />
);

export const IconDatabase = ({ className }: IconProps) => (
  <FaDatabase className={className} />
);
